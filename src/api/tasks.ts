
import {
  objectId,
} from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';

import { resource } from 'express-lemur/lib/rest/rest-router';
import { ObjectId } from 'mongodb';
import { checkTaskAccess } from '../access-control/resource-access';

import db from '../storage/database';

import * as schemas from '../types/pipeline';
import { getUser } from '../util/express-util';

export const tasks = db<schemas.Task>('tasks');

const taskQuery = Type.Object({ _id: objectId });
type TaskQuery = Static<typeof taskQuery>;

export default resource(
  {
    route: '/tasks',

    id: '_id',

    schemas: 
    {
      read: schemas.task,
      write: schemas.task,
      query: taskQuery,
    },

    accessControl: ({ _id }, _0, _1, res) => checkTaskAccess(_id, res),

    get: collectionToGetHandler<TaskQuery, typeof schemas.task>(
      tasks,
      schemas.task,
    ),

    post: async (_0, task, _1, res) => 
    {
      const user = getUser(res);

      task.owners = [new ObjectId(user.asuId)];

      const insertResult = await tasks.insertOne(task);

      return insertResult.insertedId.toHexString();
    },

    patch: async ({ _id }, newTask) => 
    {
      const task = await tasks.findOneAndUpdate(
        { _id },
        { $set: newTask as any },
      );

      return { ...task.value, ...newTask };
    },
  },
);
