
import { ObjectId } from 'mongodb';
import { TaskWrite } from '../../src/pipeline/schemas';

import tasksApi from '../../src/api/tasks';
import { parseObjectId } from '@unologin/server-common/lib/general/database';

import { Response } from 'express';

const userId = new ObjectId('62de9ee9ac751033dad45a62');

export const mockRes = 
{
  locals: { unologin: { user: { asuId: userId.toHexString() } } },
} as any as Response;

/**
 * 
 * @returns taskId
 */
export async function createTask() : Promise<ObjectId>
{
  const task : TaskWrite = 
    {
      title: 'test task',
      description: 'testing',

      params: { },
      owners: [],
    };

  return parseObjectId(
    (await tasksApi.post?.(
        null as any,
        task,
        null as any,
        mockRes,
    ) as any)._id,
  );
}
