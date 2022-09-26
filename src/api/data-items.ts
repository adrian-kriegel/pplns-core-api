

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
import { unconsume } from '../pipeline/bundle-consumptions';

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
  { taskId, nodeId } : Pick<
    schemas.DataItemQuery, 
    'taskId' | 'nodeId'
  >,
  item : 
    schemas.DataItemWrite | 
    schemas.DataItem | 
    // allows internal nodes to explicitly change the flow
    (
      Omit<schemas.DataItemWrite, 'consumptionId'> & 
      { flowId: schemas.FlowId, flowStack: schemas.FlowStack }
    )
  ,
)
{
  if (!Array.isArray(item.data))
  {
    item.data = [item.data];
  }

  const bundleProjection = 
  { 
    'consumptions.$': 1,
    '_id': 1,
    'taskId': 1,
    'consumerId': 1,
    'flowId': 1,
    'flowStack': 1,
  };

  type PBundle = Pick<
    schemas.Bundle,
    (keyof typeof bundleProjection & keyof schemas.Bundle) |
    'consumptions'
   >;

  // type of the projected bundle
  let bundle : PBundle | null = null;

  let flowStack : schemas.DataItem['flowStack'] = 
    'flowStack' in item ?
      item['flowStack'] : 
      []
  ;

  if ('consumptionId' in item && item['consumptionId'])
  {
    const bundleUpdate = await bundles.findOneAndUpdate(
      { 'consumptions._id': item.consumptionId },
      {
        $set:
        {
          done: true,
        },
      },
      {
        // this is important in order to check the value of "done"
        returnDocument: 'before',
        projection: bundleProjection,
      },
    );

    bundle = assert404(bundleUpdate.value);

    // will be the only element (see projection above)
    const con = bundle.consumptions[0] as schemas.BundleConsumption;

    if (con.done)
    {
      // [!] TODO: this prevents nodes from populating multiple output channels at once
      // this should be permitted 
      // some nodes may have multiple outputs that are NOT set at once (like filters which filter into categories)
      // possible solution: 
      //    only set "done" to true if the node has a single output
      //    any nodes with multiple outputs will have to notify the server that they are done   
      //    processing this consumption using a separate endpoint
      //                    
      //    this feature may work well in conjunction with a "batch-emit" feature for nodes to populate
      //    outputs at once
      throw badRequest()
        .msg('An item related to the consumptionId has been emitted before.')
        .data({ bundle })
      ;
    }

    if (con.expiresAt && con.expiresAt <= new Date())
    {
      await unconsume(bundle._id, con._id);

      throw badRequest()
        .msg('Consumption has expired. Consume again in order to emit items.')
        .data({ bundle, conumptionn: con })
      ;
    }

    if (nodeId && !nodeId.equals(bundle.consumerId))
    {
      throw badRequest()
        .msg(
          'nodeId does not match consumerId determined via consumptionId',
        ).data(
          { nodeId, inputBundle: bundle },
        )
      ;
    }

    item.flowId ??= bundle.flowId;
    flowStack = bundle.flowStack;

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
          flowStack,
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
        .data(
          { 
            taskId,
            nodeId,
            item,
          },
        )
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
      (q) => removeUndefined(
        {
          ...q,
          limit: undefined,
          offset: undefined,
          sort: undefined,
        },
      ),
      ({ sort }) => sort && Object.keys(sort).length ? sort : { _id: -1 },
    ),

    post: postDataItem,
  },
);

