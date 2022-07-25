

import {
  objectId,
} from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler, defaultSort, removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';

import { resource } from 'express-lemur/lib/rest/rest-router';
import { Collection } from 'mongodb';
import { checkTaskAccess } from '../access-control/resource-access';

import db from '../storage/database';
import * as schemas from '../types/pipeline';
import { dataItems } from './data-items';

export const bundles = db<schemas.Bundle>('bundles');

const bundleQuery = Type.Object(
  {
    _id: objectId,
    taskId: objectId,
    nodeId: objectId,
    done: Type.Optional(Type.Boolean()),
  },
);

type BundleQuery = Static<typeof bundleQuery>;

export default resource(
  {
    route: '/tasks/:taskId/nodes/:nodeId/inputs',
    id: '_id',
    
    schemas:
    {
      read: schemas.bundleRead,
      query: bundleQuery,
    },

    accessControl: ({ taskId }, _0, _1, res) => checkTaskAccess(taskId, res),

    get: collectionToGetHandler<BundleQuery, typeof schemas.bundleRead>(
      bundles as Collection<any>,
      schemas.bundleRead,
      (q) => removeUndefined(q),
      defaultSort,
      [
        {
          $lookup:
          {
            from: dataItems.collectionName,
            localField: 'itemIds',
            foreignField: '_id',
            as: 'items',
          },
        },
      ],
    ),
  },
);
