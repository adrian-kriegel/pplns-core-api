
import type { Response } from 'express';

import * as unologin from '@unologin/node-api';

import { unauthorized } from 'express-lemur/lib/errors';
import { assert404 } from 'express-lemur/lib/rest/rest-router';
import { Task } from '../pipeline/schemas';

export type User = 
{
  id: string;
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
    return { id: res.locals.apiClient.id };
  }
  else if (res.locals.unologin?.user)
  {
    const user : unologin.User = res.locals.unologin.user;

    return { id: user.asuId };
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

