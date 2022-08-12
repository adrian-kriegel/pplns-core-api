
import { assert404 } from 'express-lemur/lib/rest/rest-router';
import { ObjectId } from 'mongodb';
import * as schemas from '../schemas/pipeline';
import { bundles, dataItems, workers } from '../storage/database';
import Mutex from '../util/mutex';
import { getInternalWorker, IInternalWorker } from './internal-workers';

export interface IWorker
{
  upsertBundle: (
    producerId : ObjectId,
    consumer : schemas.Node,
    items : schemas.DataItem,
  ) => Promise<any>;
}

/**
 * Worker handle
 */
export class ExternalWorker implements IWorker
{
  private doc?: schemas.Worker | null;

  /** */
  constructor(
    public readonly _id: ObjectId,
  ) {}

  /** @returns worker document */
  async get()
  {
    this.doc ||= await workers.findOne({ _id: this._id });

    return assert404(this.doc);
  }

  /**
   * Find any bundles with a larger flow stack and add to those.
   * Will resolve to true if the item has been added to higher level bundles.
   * @param consumer item
   * @param item item
   * @returns Promise<boolean> (true if there were bundles)
   */
  async addToHigherLevelBundles(
    consumer : schemas.Node,
    item : schemas.DataItem,
  )
  {
    return Promise.all(
      await bundles.find(
        {
          taskId: item.taskId,
          consumerId: consumer._id,
          done: false,
          // check if there is a bundle whose flowId is "above" item.flowId
          // this means that item.flowId is in bundle.lowerFlowIds
          lowerFlowIds: item.flowId,
        },
      ).map(
        (bundle) => 
        {
          return this.upsertBundle(
            item.nodeId,
            consumer,
            {
              ...item,
              flowId: bundle.flowId, 
            },
            bundle._id,
          );
        },
      ).toArray(),
    );
  }

  /**
   * Non "thread"-safe version o upsertBundle
   * @param producerId id of producer node
   * @param consumer consumer node
   * @param item data item
   * @param specificBundleId provide if target bundle is known
   * @returns update result
   */
  async upsertBundle(
    producerId : ObjectId,
    consumer : schemas.Node,
    item : schemas.DataItem,
    specificBundleId?: ObjectId,
  )
  {
    const expectedDepth = item.producerNodeIds.filter(
      (producerId) => producerId.equals(consumer._id),
    ).length;

    const worker = await this.get();

    const input = findInputForItem(item, consumer);

    // if item needs to be added to higher level items, skip the logic below
    if (
      !specificBundleId &&
      (await this.addToHigherLevelBundles(
        consumer,
        item,
      )).length > 0
    )
    {
      return;
    }

    const itemFlowIds = [
      item.flowId,
      ...item.flowStack.map(({ flowId }) => flowId),
    ];

    const bundleQuery = specificBundleId ?
      {
        _id: specificBundleId,
      } :
      {
        taskId: item.taskId,
        consumerId: consumer._id,
        done: false,
        // there may already be a bundle with a lower flow stack
        // which was mistakenly created after an item from a lower flow stack had finished
        flowId: { 
          $in: itemFlowIds,
        },
        depth: expectedDepth,
      }
    ;

    const { value: bundle } = await bundles.findOneAndUpdate(
      bundleQuery,
      {
        $push: 
        {
          inputItems:
          {
            position: Object.keys(worker.inputs).findIndex(
              (c) => input.inputChannel === c,
            ),
            itemId: item._id,
            nodeId: item.nodeId,
            outputChannel: item.outputChannel,
            inputChannel: input.inputChannel,
          },
        },
        $addToSet:
        {
          lowerFlowIds: 
          {
            $each: item.flowStack.map(({ flowId }) => flowId),
          },
        },
        $setOnInsert: 
        {
          // immediately set done to true if @param item is the only input
          done: consumer.inputs.length === 1,
          createdAt: new Date(),
        },
        $set:
        {
          workerId: this._id,

          // see comment about flowId in query above
          flowId: item.flowId,

          numTaken: 0,
          numAvailable: consumer.numExecutions || 1,
        },
      },
      {
        upsert: !specificBundleId,
        returnDocument: 'after',
      },
    );

    /*
    TODO: this whole thing is only required for nodes that take in items from different levels of splits and joins

    it will not return any lower level items if all inputs come from the same level

    determine levels and don't run this stuff if not required
    */

    const missingInputs = consumer.inputs.filter(
      (input) => 
        !bundle.inputItems.find(
          ({ nodeId, outputChannel }) => 
            input.nodeId.equals(nodeId) &&
            input.outputChannel == outputChannel,
        ),
    );

    // lower level items can be assumed to be done
    // because the split node will only split once done
    const lowerLevelItems = missingInputs.length ?
      await dataItems.find(
        {
          taskId: item.taskId,

          // find any items in a parent flow
          flowId: { $in: item.flowStack.map(({ flowId }) => flowId) },

          // both of the following expressions are redundant but they speed up the query through index lookups
          nodeId:
          {
            $in: missingInputs.map(({ nodeId }) => nodeId),
          },

          outputChannel: 
          {
            $in: missingInputs.map(({ outputChannel }) => outputChannel),
          },

          // this is the actual "filtering" part of the { nodeId, outputChannel } query
          // in short: "find where [nodeId, outputChannel] one of [[nodeId1, outputChannel1]...]"
          $expr: 
          {
            $or: missingInputs.map(
              ({ outputChannel, nodeId }) => 
                (
                  {
                    $eq: 
                    [
                      ['$nodeId', '$outputChannel'],
                      [nodeId, outputChannel],
                    ],
                  }
                ),
            ),
          },
        },
      ).toArray() :
      []
    ;

    const lowerLevelInputItems = lowerLevelItems.map((item) => 
      (
        {
          position: Object.keys(worker.inputs).findIndex(
            (c) => input.inputChannel === c,
          ),
          nodeId: item.nodeId,
          outputChannel: item.outputChannel,
          itemId: item._id,
          inputChannel: findInputForItem(item, consumer).inputChannel,
        }
      ),
    );

    const allInputItems : schemas.Bundle['inputItems'] = [
      ...bundle.inputItems,
      ...lowerLevelInputItems,
    ];

    const bundleDone =
      allInputItems.length === consumer.inputs.length
    ;

    // if another update is required
    if (
      // bundle.done needs to be updated in the database
      (!bundle.done && bundleDone) || 
      // new items need to be added to the bundle
      lowerLevelItems.length > 0
    )
    {
      if (bundleDone)
      {
        // once the bundle is done, sort the input items
        return bundles.updateOne(
          { _id: bundle._id, done: false },
          {
            $set: 
            {
              inputItems: allInputItems.sort(
                ({ position: a }, { position: b }) => a - b,
              ),
              done: true,
            },
          },
        );
      }
      else 
      {
        // TODO set done using aggregation in updateOne 
        return bundles.updateOne(
          { _id: bundle._id, done: false },
          {
            $addToSet:
            {
              inputItems: { $each: lowerLevelInputItems },
            },
          },
        );
      }
    }
  }
}


/**
* @param producerId id of producer node
* @param consumer consumer node
* @param item data item
* @returns update result
*/
export async function upsertBundle(
  ...args : Parameters<IWorker['upsertBundle']>
)
{
  const consumer = args[1];

  const mutex = await new Mutex(consumer._id.toHexString()).take();

  try 
  {
    const result = await (consumer.internalWorker ? 
      getInternalWorker(consumer.internalWorker).upsertBundle(...args) :
      new ExternalWorker(consumer.workerId).upsertBundle(...args)
    );

    return result;
  }
  finally
  {
    await mutex.free();
  }
}


/**
 * 
 * @param item item
 * @param consumer consumer
 * @returns input for this item or undefined
 */
export function findInputForItem(
  item : schemas.DataItem,
  consumer : schemas.Node,
)
{
  return consumer.inputs.find(
    ({ nodeId, outputChannel }) => 
      nodeId.equals(item.nodeId) &&
      outputChannel === item.outputChannel,
  );
}

/**
 * @returns worker for node
 * @throws 404 if not found
 */
export async function findWorkerForNode(
  { internalWorker, workerId } 
  : Pick<schemas.Node, 'internalWorker' | 'workerId'>,
) : Promise<schemas.Worker | IInternalWorker>
{
  return assert404(
    internalWorker ? 
      getInternalWorker(internalWorker) :
      await workers.findOne({ _id: workerId }),
  );
}
