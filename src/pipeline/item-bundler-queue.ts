/**
 * Implements a queue which allows any lambda functions etc. to request items to be
 * bundled asynchronously by the background worker. 
 * 
 * Once a dataItem is "done", it is pushed into the queue.
 * The background worker will pop the queue to perform the bundling.
 */

import { ModifyResult, ObjectId } from 'mongodb';
import { upsertBundle } from './worker';

import * as schemas from './schemas';
import collection, { nodes } from '../storage/database';
import { dataItems } from '../storage/database';
import { config } from '../main/config';

export type BundleRequest = 
{
  // reflects dataItem._id
  _id: ObjectId;
}

const bundleRequests = collection<BundleRequest>('bundleRequests');

/**
 * Inserts the item into the queue to be bundled.
 * @param itemId itemId
 * @returns Promise
 */
export async function requestBundling(itemId : ObjectId)
{
  await bundleRequests.insertOne({ _id: itemId });

  if (config.runBundlerAfterItemInsert)
  {
    await processBundleRequests();
  }
}


let bundlerRunning = false;
/**
 * Processes all pending bundle requests. Resolves once done.
 * @returns Promise
 */
export async function processBundleRequests()
{
  if (bundlerRunning)
  {
    return;
  }

  bundlerRunning = true;

  let total = 0;

  try
  {
    let req : ModifyResult<
      Omit<BundleRequest, '_id'> & { _id?: ObjectId; }
    > | null;
   
    do
    {
      req = await bundleRequests.findOneAndDelete({});
   
      if (req.value?._id)
      {
        await bundleDataItem(await dataItems.findOne({ _id: req.value._id }));
        ++total;
      }
   
    } while (req.value?._id);
  }
  finally 
  {
    bundlerRunning = false;
  }

  return total;
}

/**
 * Pushes item into its destination bundles.
 * Updates bundle status if bundle is full.
 * 
 * Should be executed only by the background worker.
 * 
 * TODO: handle the edge case where the same output is connected to two inputs on the same node
 * 
 * @param item dataitem
 * 
 * @returns Promise
 */
async function bundleDataItem(
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

  // insert the items one by one to avoid any race conditions
  // Promise.all COULD be used if a mutex is used within upsert bundle to only allow
  // 1 concurrent insertion per consumer 
  // running upsertBundle in parallel for different consumers will NOT work 
  // because upsertBundle will sometimes call itself on another consumer (as implemented in split/join nodes)
  for (const consumer of consumers)
  {
    await upsertBundle(
      nodeId,
      consumer,
      item,
    );
  }
}
