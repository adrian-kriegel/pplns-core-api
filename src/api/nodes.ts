
import {
  objectId,
} from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler, defaultSort, removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';
import { notFound } from 'express-lemur/lib/errors';

import { resource } from 'express-lemur/lib/rest/rest-router';
import { Collection } from 'mongodb';
import { checkTaskAccess } from '../middleware/resource-access';

import * as schemas from '../schemas/pipeline';
import { nodes, workers } from '../storage/database';
import { simplePatch } from '../util/rest-util';

const nodeQuery = Type.Object(
  {
    _id: Type.Optional(objectId),
    taskId: objectId,
  },
);

type NodeQuery = Static<typeof nodeQuery>;

export default resource(
  {
    route: '/tasks/:taskId/nodes',

    id: '_id',

    schemas: 
    {
      read: schemas.nodeRead,
      write: schemas.nodeWrite,
      query: nodeQuery,
    },

    accessControl: ({ taskId }, _0, _1, res) => checkTaskAccess(taskId, res),

    get: collectionToGetHandler<NodeQuery, typeof schemas.nodeRead>(
      nodes as Collection<any>,
      schemas.nodeRead,
      (q) => removeUndefined(q),
      defaultSort,
      [
        {
          $lookup:
          {
            from: 'workers',
            as: 'worker',
            localField: 'workerId',
            foreignField: '_id',
          },
        },
        {
          $addFields:
          {
            worker: { $arrayElemAt: ['$worker', 0] },
          },
        },
      ],
    ),

    post: async ({ taskId }, node) => 
    {
      const doc = { ...node, taskId, createdAt: new Date() };

      const [insertResult, worker] = await Promise.all(
        [
          nodes.insertOne(doc),
          workers.findOne({ _id: doc.workerId }),
        ],
      );

      return {
        ...doc,
        _id: insertResult.insertedId,
        worker,
      };
    },

    patch: ({ taskId, _id }, newNode) => 
      simplePatch<schemas.NodeRead>(nodes, { taskId, _id }, newNode),

    delete: async ({ taskId, _id }) => 
    {
      const result = await nodes.deleteOne({ taskId, _id });

      if (result.deletedCount !== 1)
      {
        throw notFound()
          .msg('Node not found')
          .data({ _id, taskId })
        ;
      }
    },
  },
);
