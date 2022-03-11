
import db from '../storage/database';

import { objectId } from '@unologin/server-common/lib/schemas/general';

import { Type, Static } from '@unologin/typebox-extended/typebox';

export const task = Type.Object(
  {
    _id: objectId,
    // asuId of the owner
    owner: objectId,
    // name of the task
    name: Type.String(),
    // human readable description
    description: Type.String({ default: 'no description' }),
    // total number of images
    numImages: Type.Number({ minimum: 1 }),
  },
);

export type Task = Static<typeof task>;

export const tasks = db<Task>('tasks');
