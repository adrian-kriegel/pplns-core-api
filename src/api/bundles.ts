

import {
  objectId,
} from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler, defaultSort, removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';

import { resource } from 'express-lemur/lib/rest/rest-router';
import { Collection } from 'mongodb';
import { checkTaskAccess } from '../middleware/resource-access';

import * as schemas from '../schemas/pipeline';
import { bundles } from '../storage/database';

const bundleQuery = Type.Object(
  {
    _id: Type.Optional(objectId),
    taskId: objectId,
    consumerId: objectId,
    done: Type.Optional(Type.Boolean()),
    bundle: Type.Optional(Type.String()),
  },
);

type BundleQuery = Static<typeof bundleQuery>;

const getBundlesWithUnorderedItems = 
collectionToGetHandler<BundleQuery, typeof schemas.bundleRead>(
  bundles as Collection<any>,
  schemas.bundleRead,
  (q) => removeUndefined(q),
  defaultSort,
  [
    {
      $lookup:
      {
        from: 'dataItems', // dataItems.collectionName, (won't work because of circular deps => TODO: fix)
        localField: 'itemIds',
        foreignField: '_id',
        as: 'items',
      },
    },
  ],
);

export default resource(
  {
    route: '/tasks/:taskId/nodes/:consumerId/inputs',
    id: '_id',
    
    schemas:
    {
      read: schemas.bundleRead,
      query: bundleQuery,
    },

    accessControl: ({ taskId }, _0, _1, res) => checkTaskAccess(taskId, res),

    get: async (...args) => 
    { 
      const { results, total } = await getBundlesWithUnorderedItems(...args);

      return {
        total,
        // ensure that the 'items' are in the same order as the itemIds (which are in the order the consumer expects)
        // TODO: somehow order the items in the aggregation lookup stage to avoid the mess below
        results: results.map(
          (bundle) => 
            (
              {
                ...bundle,
                items: bundle.itemIds
                  .map(
                    (itemId) => 
                      (bundle as any as schemas.BundleRead).items.find(
                        ({ _id }) => itemId.equals(_id),
                      ),
                  ),
              }
            ), 
        ),
      };
    },
  },
);

