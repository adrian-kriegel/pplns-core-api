
import { objectId } from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler, removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';
import { resource } from 'express-lemur/lib/rest/rest-router';

import * as schemas from '../schemas/pipeline';
import { workers } from '../storage/database';
import { simplePatch } from '../util/rest-util';

const workerQuery = Type.Object(
  {
    _id: Type.Optional(objectId),
  },
);

type WorkerQuery = Static<typeof workerQuery>;

export default resource(
  {
    id: '_id',

    route: '/workers',

    schemas:
    {
      read: schemas.worker,
      write: schemas.workerWrite,
      query: workerQuery,
    },

    // [!] TODO
    accessControl: () => Promise.resolve(),

    get: collectionToGetHandler<WorkerQuery, typeof schemas.worker>(
      workers,
      schemas.worker,
      (q) => removeUndefined(q),
    ),

    post: async (q, doc) => 
    {
      const worker : Omit<schemas.Worker, '_id'> = 
      {
        ...doc,
        createdAt: new Date(),
      };

      return {
        ...worker,
        _id: (await (workers.insertOne(worker))).insertedId,
      };
    },

    patch: (q, doc) => simplePatch(workers, q, doc),
  },
);
