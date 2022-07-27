
import {
  objectId,
} from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler, removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';
import { badRequest, forbidden } from 'express-lemur/lib/errors';

import { resource } from 'express-lemur/lib/rest/rest-router';
import { checkTaskAccess } from '../middleware/resource-access';

import * as schemas from '../schemas/pipeline';
import { bundles, dataItems, nodes } from '../storage/database';
import { simplePatch } from '../util/rest-util';

const dataItemQuery = Type.Object(
  {
    _id: Type.Optional(objectId),
    taskId: objectId,
    nodeId: objectId,
    done: Type.Optional(Type.Boolean()),
    bundle: Type.Optional(Type.Boolean()),
  },
);

type DataItemQuery = Static<typeof dataItemQuery>;

/**
 * Pushes item into its destination bundles.
 * Updates bundle status if bundle is full.
 * 
 * @param item dataitem
 * 
 * @returns Promise<void>
 */
async function onItemDone(
  { nodeId, taskId, _id: itemId, bundle, output } : schemas.DataItem,
)
{
  const consumers = await nodes.find(
    {
      // find nodes where the data item is an input
      inputs: { $elemMatch: { nodeId, output } },
    },
  ).toArray();

  const bundleUpserts = await Promise.all(
    consumers.map(({ _id: consumerId, inputs }) => 
      bundles.findOneAndUpdate(
        {
          taskId,
          consumerId,
          bundle,
        },
        {
          $push:
          {
            // push the value into the correct position
            itemIds: 
            {
              $each: [itemId],
              $position: inputs.findIndex(
                (input) => 
                  input.nodeId.equals(nodeId) && 
                  input.output === output
                ,
              ),
            },
          },
          $setOnInsert: 
          {
            done: inputs.length === 1,
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
        },
      ),
    ),
  );
  
  // array of booleans indicating whether or not to update the state to done for each bundle
  const updateDone = consumers.map(
    (consumer, i) => 
    {
      const bundle = bundleUpserts[i].value;

      if (bundle.done)
      {
        return false;
      }

      // put itemId in bundle (findOneAndUpdate will return value BEFORE update)
      if (!bundle.itemIds.find((_id) => _id.equals(itemId)))
      {
        bundle.itemIds.push(itemId);
      }

      // bundle is done once it's full
      return bundle.itemIds.length === consumer.inputs.length;
    },
  );

  // update "done" bundles
  await bundles.updateMany(
    {
      _id:
      {
        // only update bundles that are "done"
        $in: bundleUpserts.map(
          ({ value: { _id } }) => _id,
        ).filter((_, i) => updateDone[i]),
      },
    },
    {
      $set:
      {
        done: true,
      },
    },
  );
}

export default resource(
  {
    route: 
    [
      '/tasks/:taskId/nodes/:nodeId/outputs',
    ],

    id: '_id',

    schemas:
    {
      read: schemas.dataItem,
      write: schemas.dataItemWrite,
      query: dataItemQuery,
    },

    accessControl: async ({ taskId, _id }, _0, { method }, res) => 
    {
      await checkTaskAccess(taskId, res);

      if (_id)
      {
        const item = await dataItems.findOne({ _id });

        res.locals.targetResource;

        if (method !== 'GET' && item.done)
        {
          throw forbidden()
            .msg('Cannot change data-item that is already "done".');
        }
      }

    },

    getOne: (_0, _1, res) => res.locals.targetResource,

    get: collectionToGetHandler<DataItemQuery, typeof schemas.dataItem>(
      dataItems,
      schemas.dataItem,
      (q) => removeUndefined(q),
    ),

    post: async ({ taskId, nodeId }, inputItem) => 
    {
      const item = { ...inputItem, taskId, nodeId };

      try 
      {
        const itemId = (
          await dataItems.insertOne(item)
        ).insertedId;
  
        if (item.done)
        {
          await onItemDone(
            {
              ...item,
              _id: itemId,
            },
          );
        }
  
        return { ...item, _id: itemId };
      }
      catch (e)
      {
        if (e.code === 11000)
        {
          throw badRequest()
            .msg(
              `Output from ${nodeId} to bundle ${item.bundle} already exists`,
            );
        }
        else 
        {
          throw e;
        }
      }
    },

    patch: async ({ taskId, _id, nodeId }, item) => 
    {
      const newItem = await simplePatch<schemas.DataItem>(
        dataItems,
        {
          _id,
          taskId,
          nodeId,
        },
        item,
      );

      if (newItem.done)
      {
        await onItemDone(newItem);
      }
      
      return newItem;
    },
  },
);

