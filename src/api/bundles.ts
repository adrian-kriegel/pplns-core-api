

import {
  objectId,
} from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler, defaultSort, removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';

import { resource } from 'express-lemur/lib/rest/rest-router';
import { Collection, ObjectId } from 'mongodb';
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
    limit: Type.Optional(Type.Integer({ minimum: 1 })),
    // set to true if returned bundles should be consumed
    consume: Type.Optional(Type.Boolean()),
    consumedUpdateId: Type.Optional(objectId),
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
    route: [
      '/tasks/:taskId/nodes/:consumerId/inputs',
    ],
    id: '_id',
    
    schemas:
    {
      read: schemas.bundleRead,
      query: bundleQuery,
    },

    accessControl: ({ taskId }, _0, _1, res) => checkTaskAccess(taskId, res),

    get: async (...args) => 
    { 
      const q = args[0];

      if (q.consume)
      {
        // mark all updated documents with a unique id to fetch them later
        const consumedUpdateId = new ObjectId();

        await bundles.updateMany(
          removeUndefined(
            {
              ...q,
              consumedAt: { $exists: false },
              limit: undefined,
              consume: undefined,
            },
          ),
          {
            $set:
            {
              consumedAt: new Date(),
              consumedUpdateId,
            },
          },
        );

        // TODO: check update success

        // alter the query to only include the just updated resources
        args[0] = { consumedUpdateId } as BundleQuery;
      }

      // @ts-ignore
      // eslint-disable-next-line
      const { results, total } = await getBundlesWithUnorderedItems(...args)

      return {
        total: total || results.length,
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

