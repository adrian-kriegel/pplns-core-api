
import type { Response } from 'express';

import * as unologin from '@unologin/node-api';

import { unauthorized } from 'express-lemur/lib/errors';
import { assert404 } from 'express-lemur/lib/rest/rest-router';
import { Task } from '../pipeline/schemas';
import { ObjectId } from 'mongodb';
import { parseObjectId } from '@unologin/server-common/lib/general/database';

export type User = 
{
  id: ObjectId;
};

/**
 * 
 * @param res express res
 * @throws unauthorized if not logged in
 * @returns unologin user
 */
export function getUser(
  res : Response,
) : User
{
  if (res.locals.apiClient)
  {
    return { id: new ObjectId(0) };
  }
  else if (res.locals.unologin?.user)
  {
    const user : unologin.User = res.locals.unologin.user;

    return { id: parseObjectId(user.asuId) };
  }
  else 
  {
    throw unauthorized()
      .msg('login required');
  }
}

/**
 * @param res express res
 * @returns task document
 */
export function getTask(res : Response) : Task
{
  return assert404(res.locals.taskResource);
}

