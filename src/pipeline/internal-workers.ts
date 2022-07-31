
import * as schemas from '../schemas/pipeline';

import { IWorker } from './worker';

export type IInternalWorker = IWorker & 
  Omit<schemas.Worker, '_id' | 'createdAt'>;

const workers : { [workerId: string]: IInternalWorker } = {};

/**
 * 
 * @param workerId id
 * @returns worker or undefined
 */
export function getInternalWorker(workerId : string)
{
  return workers[workerId];
}

/**
 * @param workerId workerId
 * @param worker worker
 * @returns void
 */
export function registerInternalWorker(
  workerId: string,
  worker : IInternalWorker,
)
{
  if (workerId in workers)
  {
    throw new Error(`Worker ${workerId} already exists.`);
  }

  workers[workerId] = worker;
}
