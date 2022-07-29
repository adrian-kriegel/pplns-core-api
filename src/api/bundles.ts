

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
import { bundles, dataItems } from '../storage/database';

import { mapMask } from '@unologin/server-common/lib/util/util';

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
  },
);

type BundleQuery = Static<typeof bundleQuery>;

const getBundlesWithUnorderedItems = 
collectionToGetHandler<BundleQuery, typeof schemas.bundleRead>(
  bundles as Collection<any>,
  schemas.bundleRead,
  // remove all items from query that do not appear in the bundle schema (consume, limit, etc.)
  (q) => mapMask(q, Object.keys(schemas.bundle.properties) as any),
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

/**
 * 
 * @param results bundles
 * @returns bundles with ordered items
 */
function orderItemsInBundles(
  results : schemas.BundleRead[],
) : schemas.BundleRead[]
{
  return results.map(
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
  );
}

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
        // TODO: allow for taking more than one bundle at a time
        
        const findQuery = removeUndefined(
          {
            ...q,
            consumedAt: { $exists: false },
            limit: undefined,
            consume: undefined,
          },
        );

        // TODO: check update success
        const { value: bundle } = await bundles.findOneAndUpdate(
          findQuery,
          {
            $set:
            {
              consumedAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          },
        );

        const [items, total] = await Promise.all(
          [
            bundle ? 
              dataItems.find({ _id: { $in: bundle.itemIds } }).toArray() :
              Promise.resolve([]),

            bundles.countDocuments(findQuery),
          ],
        );

        return { 
          // total needs to be incremented as countDocuments is performed after consuming
          total: total +1,
          results: bundle ?
            orderItemsInBundles([{ ...bundle, items }]) :
            [],
        };
      }

      const { results, total } = await getBundlesWithUnorderedItems(...args);

      return {
        total: total || results.length,
        // ensure that the 'items' are in the same order as the itemIds (which are in the order the consumer expects)
        // TODO: somehow order the items in the aggregation lookup stage to avoid the mess below
        results: orderItemsInBundles(results),
      };
    },
  },
);
