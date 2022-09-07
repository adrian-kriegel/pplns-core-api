
import {
  collectionToGetHandler,
  removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';
import { badRequest } from 'express-lemur/lib/errors';
import { resource } from 'express-lemur/lib/rest/rest-router';
import { getInternalWorker } from '../pipeline/internal-workers';

import * as schemas from '../pipeline/schemas';
import { workers } from '../storage/database';
import { simplePatch } from '../util/rest-util';

const workerQuery = Type.Object(
  {
    _id: Type.Optional(Type.String()),
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

    put: async (q, doc) => 
    {
      if (getInternalWorker(q._id))
      {
        throw badRequest()
          .msg(
            `Worker._id ${q._id} is reserved internally.`,
          )
        ;
      }

      const result = await workers.findOneAndUpdate(
        removeUndefined(q),
        {
          $set: doc,
          $setOnInsert:
          {
            createdAt: new Date(),
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
        },
      );

      return result.value; 
    },

    patch: (q, doc) => simplePatch(workers, q, doc),
  },
);
