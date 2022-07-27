
import { parseObjectId } from '@unologin/server-common/lib/general/database';
import {
  objectId,
} from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler, removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';

import { resource } from 'express-lemur/lib/rest/rest-router';

import { checkTaskAccess } from '../middleware/resource-access';

import db from '../storage/database';

import * as schemas from '../schemas/pipeline';
import { getUser } from '../util/express-util';
import { simplePatch } from '../util/rest-util';

export const tasks = db<schemas.Task>('tasks');

const taskQuery = Type.Object({ _id: Type.Optional(objectId) });
type TaskQuery = Static<typeof taskQuery>;

export default resource(
  {
    route: '/tasks',

    id: '_id',

    schemas: 
    {
      read: schemas.task,
      write: Type.Omit(schemas.task, ['_id']),
      query: taskQuery,
    },

    accessControl: ({ _id }, _0, _1, res) => 
    {
      if (_id)
      {
        return checkTaskAccess(_id, res);
      }
      else 
      {
        return Promise.resolve();
      }
    },

    get: collectionToGetHandler<TaskQuery, typeof schemas.task>(
      tasks,
      schemas.task,
      // [!] TODO: only return tasks the user owns
      (q) => removeUndefined(q),
    ),

    post: async (_0, task, _1, res) => 
    {
      const user = getUser(res);

      task.owners = [parseObjectId(user.asuId)];

      const insertResult = await tasks.insertOne(task);

      return insertResult.insertedId.toHexString();
    },

    patch: ({ _id }, newTask) => 
      simplePatch(tasks, { _id }, newTask),
  },
);
