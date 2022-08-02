
import { assert404 } from 'express-lemur/lib/rest/rest-router';
import { ObjectId } from 'mongodb';
import * as schemas from '../schemas/pipeline';
import { bundles, dataItems, workers } from '../storage/database';
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
  private doc?: schemas.Worker;

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
   * @param producerId id of producer node
   * @param consumer consumer node
   * @param item data item
   * @returns update result
   */
  async upsertBundle(
    producerId : ObjectId,
    consumer : schemas.Node,
    item : schemas.DataItem,
  )
  {
    // TODO use aggregation in update to udate in one go

    const expectedDepth = item.producerNodeIds.filter(
      (producerId) => producerId.equals(consumer._id),
    ).length;

    const worker = await this.get();

    const input = findInputForItem(item, consumer);

    const { value: bundle } = await bundles.findOneAndUpdate(
      {
        taskId: item.taskId,
        consumerId: consumer._id,
        done: false,
        // there may already be a bundle with a higher flow stack
        // which was mistakenly created after an item from a higher flow stack had finished
        flowId: { 
          $in: [
            item.flowId,
            ...item.flowStack.map(({ flowId }) => flowId),
          ],
        },
        depth: expectedDepth,
      },
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
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );

    /*
    TODO: this whole thing is only required for nodes that take in items from different levels of splits and joins

    it will not return any higher level items if all inputs come from the same level

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

    // higher level items can be assumed to be done
    // because the split node will only split once done
    const higherLevelItems = missingInputs.length ?
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

    const higherLevelInputItems = higherLevelItems.map((item) => 
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
      ...higherLevelInputItems,
    ];

    const bundleDone =
      allInputItems.length === consumer.inputs.length
    ;

    // if another update is required
    if (
      // bundle.done needs to be updated in the database
      (!bundle.done && bundleDone) || 
      // new items need to be added to the bundle
      higherLevelItems.length > 0
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
              inputItems: { $each: higherLevelInputItems },
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
export function upsertBundle(
  ...args : Parameters<IWorker['upsertBundle']>
)
{
  const consumer = args[1];

  return consumer.internalWorker ? 
    getInternalWorker(consumer.internalWorker).upsertBundle(...args) :
    new ExternalWorker(consumer.workerId).upsertBundle(...args);
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
