
import {
  objectId,
} from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';

import { resource } from 'express-lemur/lib/rest/rest-router';
import { checkTaskAccess } from '../access-control/resource-access';

import db from '../storage/database';
import * as schemas from '../types/pipeline';

export const nodes = db<schemas.Node>('nodes');

const nodeQuery = Type.Object(
  {
    _id: objectId,
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
      return (await nodes.insertOne({ ...node, taskId }))
        .insertedId.toHexString()
      ;
    },
  },
);
