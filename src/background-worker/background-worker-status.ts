import collection from '../storage/database';

export type BackgroundWorkerStatus = 
{
  _id: 'worker-status';
  lastExec: Date | null;
}

const workerStatusCollection = collection<BackgroundWorkerStatus>(
  'workerStatus',
);

/**
 * Tells the system that the worker is still alive and well :-)
 * @returns promise
 */
export function ping()
{
  return workerStatusCollection.updateOne(
    { _id: 'worker-status' },
    {
      $set: { lastExec: new Date() },
    },
    {
      upsert: true,
    },
  );
}

/**
 * @returns the worker status
 */
export async function getWorkerStatus() : Promise<BackgroundWorkerStatus>
{
  return (await workerStatusCollection.findOneAndUpdate(
    { _id: 'worker-status' },
    {
      $setOnInsert: { lastExec: null },
    },
    {
      upsert: true,
      returnDocument: 'after',
    },
  )).value;
}
