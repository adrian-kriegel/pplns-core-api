

import {
  collectionToGetHandler, removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { badRequest, forbidden } from 'express-lemur/lib/errors';

import { assert404, resource } from 'express-lemur/lib/rest/rest-router';
import { ObjectId } from 'mongodb';
import { checkTaskAccess } from '../middleware/resource-access';

import { upsertBundle } from '../pipeline/worker';

import * as schemas from '../pipeline/schemas';
import { bundles, dataItems, nodes } from '../storage/database';

/**
 * Pushes item into its destination bundles.
 * Updates bundle status if bundle is full.
 * 
 * TODO: handle the edge case where the same output is connected to two inputs on the same node
 * 
 * @param item dataitem
 * 
 * @returns Promise<void>
 */
export async function onItemDone(
  item : schemas.DataItem,
)
{
  const { nodeId, outputChannel } = item;

  const consumers = await nodes.aggregate<schemas.Node>(
    [
      {
        $match: 
        {
          'taskId': item.taskId,
          'inputs.outputChannel': outputChannel,
          'inputs.nodeId': nodeId,
          'inputs': { $elemMatch: { nodeId, outputChannel } },
        },
      },
    ],
  ).toArray();

  await Promise.all(
    consumers.map((consumer) => 
      upsertBundle(
        nodeId,
        consumer,
        item,
      ),
    ),
  );
}

/**
 * 
 * @param param0 { taskId, nodeId, inputBundleId }
 * @param item item
 * @returns item
 */
export async function postDataItem(
  { taskId, nodeId, inputBundleId } : {
    taskId?: ObjectId,
    nodeId?: ObjectId,
    inputBundleId?: ObjectId
  }, 
  item : schemas.DataItemWrite | schemas.DataItem,
)
{
  if (!Array.isArray(item.data))
  {
    item.data = [item.data];
  }

  if (inputBundleId)
  {
    const bundle = assert404(await bundles.findOne({ _id: inputBundleId }));

    item.flowId ??= bundle.flowId;
    item.flowStack ??= bundle.flowStack;

    if (nodeId && !nodeId.equals(bundle.consumerId))
    {
      throw badRequest()
        .msg(
          'nodeId does not match nodeId determined via inputBundleId',
        ).data(
          { nodeId, inputBundle: bundle },
        )
      ;
    }

    nodeId ??= bundle.consumerId;
    taskId ??= bundle.taskId;
  }
  
  // {taskId, nodeId, flowId, output} form a unique index (see db-indexes for dataItems)
  const query = 
  {
    taskId,
    nodeId,
    flowId: item.flowId,
    outputChannel: item.outputChannel,
    done: false,
  };

  try 
  {
    const updateResult = await dataItems.findOneAndUpdate(
      query,
      {
        $set:
        {
          done: item.done,
          autoDoneAfter: item.autoDoneAfter,
        },
        $push: 
        {
          data: { $each: item.data },
          producerNodeIds: nodeId,
        },
        $setOnInsert:
        {
          createdAt: new Date(),
          flowStack: item.flowStack || [],
          flowId: item.flowId || new ObjectId(),
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );

    const dbItem = updateResult.value;
    
    if (
      dbItem.done ||
      (
        dbItem.autoDoneAfter &&
        dbItem.data.length >= dbItem.autoDoneAfter
      )
    )
    {
      await Promise.all(
        [
          !dbItem.done ?
            dataItems.updateOne(
              { _id: dbItem._id },
              { $set: { done: true } },
            ) : Promise.resolve(),
          onItemDone(dbItem),
        ],
      );
    }

    return dbItem;
  }
  catch (e)
  {
    // since "upsert" is used above, "11000" (duplicate key) can only happen
    // if item is done already and thus should not be changed anymore
    if (e.code === 11000)
    {
      throw badRequest()
        .msg('Item is "done". Update rejected.')
        .data({ taskId, nodeId, output: item.outputChannel })
      ;
    }
    else 
    {
      throw e;
    }
  }
}

export default resource(
  {
    route: 
    [
      '/outputs',
      '/tasks/:taskId/nodes/:nodeId/outputs',
    ],

    id: '_id',

    schemas:
    {
      read: schemas.dataItem,
      write: schemas.dataItemWrite,
      query: schemas.dataItemQuery,
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

    get: collectionToGetHandler<schemas.DataItemQuery, typeof schemas.dataItem>(
      dataItems,
      schemas.dataItem,
      (q) => removeUndefined(q),
    ),

    post: postDataItem,
  },
);

