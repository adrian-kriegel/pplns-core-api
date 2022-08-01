
import { assert404 } from 'express-lemur/lib/rest/rest-router';
import { ObjectId } from 'mongodb';
import * as schemas from '../schemas/pipeline';
import { bundles, workers } from '../storage/database';
import { getInternalWorker } from './internal-workers';

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
    { taskId, flowId, _id: itemId, outputChannel } : schemas.DataItem,
  )
  {
    // TODO use aggregation in update to udate in one go

    const { value } = await bundles.findOneAndUpdate(
      {
        taskId,
        consumerId: consumer._id,
        flowId,
      },
      {
        $push:
        {
          // push the value into the correct position
          inputItems: 
          {
            $each: [{ itemId, nodeId: producerId, outputChannel }],
            $position: consumer.inputs.findIndex(
              (input) => 
                input.nodeId.equals(producerId) && 
                input.outputChannel === outputChannel
              ,
            ),
          },
        },
        $setOnInsert: 
        {
          done: consumer.inputs.length === 1,
          createdAt: new Date(),
        },
        $set:
        {
          workerId: this._id,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );
    console.log(value);
    if (
      !value.done &&
      value.inputItems.length === consumer.inputs.length
    )
    {
      await bundles.updateOne(
        { _id: value._id }, 
        { $set: { done: true } },
      );
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
