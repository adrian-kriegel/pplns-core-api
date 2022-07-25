
import {
  objectId,
} from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler, removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';

import { resource } from 'express-lemur/lib/rest/rest-router';
import { checkTaskAccess } from '../access-control/resource-access';

import db from '../storage/database';
import * as schemas from '../types/pipeline';
import { bundles } from './bundles';
import { nodes } from './nodes';

export const dataItems = db<schemas.DataItem>('dataItems');

const dataItemQuery = Type.Object(
  {
    _id: objectId,
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
  { nodeId, taskId, _id: itemId, bundle } : schemas.DataItem,
)
{
  const consumers = await nodes.find(
    {
      inputs: nodeId,
    },
  ).toArray();

  const bundleUpserts = await Promise.all(
    consumers.map(({ _id: consumerId }) => 
      bundles.findOneAndUpdate(
        {
          taskId,
          consumerId,
          bundle,
        },
        {
          $push: { itemIds: itemId },
        },
        {
          upsert: true,
        },
      ),
    ),
  );
  
  const isDoneArray = consumers.map(
    (consumer, i) => 
    {
      const bundle = bundleUpserts[i].value;

      // put itemId in bundle (findOneAndUpdate will return value BEFORE update)
      if (!bundle.itemIds.find((_id) => _id.equals(itemId)))
      {
        bundle.itemIds.push(itemId);
      }

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
        ).filter((_, i) => isDoneArray[i]),
      },
    },
    {
      done: true,
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

    accessControl: ({ taskId }, _0, _1, res) => 
      checkTaskAccess(taskId, res),

    get: collectionToGetHandler<DataItemQuery, typeof schemas.dataItem>(
      dataItems,
      schemas.dataItem,
      (q) => removeUndefined(q),
    ),

    post: async ({ taskId, nodeId }, item) => 
    {
      const itemId = (
        await dataItems.insertOne({ ...item, taskId, nodeId })
      ).insertedId;

      // if the item is done, push it into its destination bundles
      if (item.done)
      {
        await onItemDone(
          {
            ...item,
            _id: itemId,
            taskId,
            nodeId,
          },
        );
      }

      return itemId.toHexString();
    },
  },
);

