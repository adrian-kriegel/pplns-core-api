
import {
  objectId,
} from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';

import { resource } from 'express-lemur/lib/rest/rest-router';
import { checkTaskAccess } from '../middleware/resource-access';

import * as schemas from '../schemas/pipeline';
import { nodes } from '../storage/database';
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
      read: schemas.node,
      write: schemas.nodeWrite,
      query: nodeQuery,
    },

    accessControl: ({ taskId }, _0, _1, res) => checkTaskAccess(taskId, res),

    get: collectionToGetHandler<NodeQuery, typeof schemas.node>(
      nodes,
      schemas.node,
    ),

    post: async ({ taskId }, node) => 
    {
      const doc = { ...node, taskId };

      return {
        ...doc,
        _id: (await nodes.insertOne(doc)).insertedId, 
      };
    },

    patch: ({ taskId, _id }, newNode) => 
      simplePatch<schemas.Node>(nodes, { taskId, _id }, newNode),
  },
);
