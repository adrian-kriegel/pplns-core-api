
import type { Response } from 'express';

import type { User } from '@unologin/node-api';

import { unauthorized } from 'express-lemur/lib/errors';
import { assert404 } from 'express-lemur/lib/rest/rest-router';
import { Task } from '../types/pipeline';

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
  if (res.locals.unologin?.user)
  {
    return res.locals.unologin.user;
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

