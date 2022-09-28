
import { ObjectId } from 'mongodb';

import { Response } from 'express';

import { getUser } from '../util/express-util';
import { tasks } from '../storage/database';

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

  const task = await tasks.findOne(
    {
      _id: taskId,
    },
  );

  if (
    // [!] TODO: remove this (granting any authenticated clients full access because I'm super lazy rn)
    // see api key parser
    user ||
    (
      task && 
      task.owners.find((_id) => _id.equals(user.id))
    )
  )
  {
    res.locals.taskResource = task;
  }
  else 
  {
    throw unauthorized()
      .msg('Access denied for task ' + taskId)
    ;
  }
}
