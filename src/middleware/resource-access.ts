
import { ObjectId } from 'mongodb';

import { Response } from 'express';

import { getUser } from '../util/express-util';
import { tasks } from '../storage/database';
import { assert404 } from 'express-lemur/lib/rest/rest-router';
import { unauthorized } from 'express-lemur/lib/errors';

/**
 * Checks permissions for requester to access task.
 * Stores task in res.locals.taskResource if permission granted.
 * 
 * @throws unauthorized or not found
 * @param taskId taskId
 * @param res express res
 * @returns void
 */
export async function checkTaskAccess(
  taskId : ObjectId,
  res : Response,
)
{
  const user = getUser(res);

  const task = assert404(
    await tasks.findOne(
      {
        _id: taskId,
      },
    ),
  );

  if (task.owners.find((_id) => _id.equals(user.asuId)))
  {
    res.locals.taskResource = task;
  }
  else 
  {
    throw unauthorized();
  }
}
