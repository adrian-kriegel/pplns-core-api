
import {
  collectionToGetHandler,
  defaultSort,
  removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { resource } from 'express-lemur/lib/rest/rest-router';
import { Collection, ObjectId } from 'mongodb';
import { checkTaskAccess } from '../middleware/resource-access';

import * as schemas from '../pipeline/schemas';
import { bundles, dataItems } from '../storage/database';

import { mapMask } from '@unologin/server-common/lib/util/util';

import {
  initConsumptionExpiration,
  unconsume,
} from '../pipeline/bundle-consumptions';

const getBundlesWithUnorderedItems = 
collectionToGetHandler<schemas.BundleQuery, typeof schemas.bundleRead>(
  bundles as Collection<any>,
  schemas.bundleRead,
  // remove all items from query that do not appear in the bundle schema (consume, limit, etc.)
  (q) => removeUndefined(   
    mapMask(q, Object.keys(schemas.bundle.properties) as any),
  ),
  defaultSort,
  [
    {
      $lookup:
      {
        from: 'dataItems', // dataItems.collectionName, (won't work because of circular deps => TODO: fix)
        localField: 'inputItems.itemId',
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
          items: bundle.inputItems
            .map(
              ({ itemId }) => 
                (bundle as any as schemas.BundleRead).items.find(
                  ({ _id }) => itemId.equals(_id),
                ),
            ),
        }
      ), 
  );
}


/**
 * TODO: allow for taking more than one bundle at a time
 * 
 * @param query bundle query
 * @returns get result
 */
export async function consumeBundles(query : schemas.BundleQuery)
{
  const findQuery = removeUndefined(
    {
      ...query,
      done: true,
      // note that allTaken: false is only used to speed up the query 
      // semaphore-behavior is achieved through the $lt expression along with findOneAndUpdate $inc
      allTaken: false,
      $expr: { $lt: ['$numTaken', '$numAvailable'] },
      limit: undefined,
      consume: undefined,
    },
  );

  const consumptionId = new ObjectId();

  const expiresAt = query.unconsumeAfter ?
    new Date(Date.now() + query.unconsumeAfter * 1000) :
    null
  ;

  const updateResult = await bundles.findOneAndUpdate(
    findQuery,
    {
      $inc:
      {
        numTaken: 1,
      },
      $push:
      {
        consumptions:
        {
          _id: consumptionId,
          expiresAt,
          done: false,
        },
      },
    },
    {
      returnDocument: 'after',
    },
  );

  const bundle = updateResult.value;

  if (bundle && expiresAt)
  {
    initConsumptionExpiration(
      bundle._id,
      consumptionId,
      expiresAt,
    );
  }

  const [items, total] = await Promise.all(
    [
      bundle ? 
        dataItems.find(
          { _id: { $in: bundle.inputItems.map(({ itemId }) => itemId) } },
        ).toArray() :
        Promise.resolve([]),

      bundles.countDocuments(findQuery),

      // update allTaken if required
      bundle && (bundle.numTaken == bundle.numAvailable) ?
        bundles.updateOne(
          { _id: bundle._id }, 
          { $set: { allTaken: true } },
        ) :
        Promise.resolve(),
    ],
  );

  return { 
    // total needs to be incremented as countDocuments is performed after consuming
    total: bundle ? total + 1 : 0,
    results: bundle ?
      orderItemsInBundles([{ ...bundle, items }]) :
      [],
  };
}

export default resource(
  {
    route: [
      '/tasks/:taskId/nodes/:consumerId/inputs',
      '/workers/:workerId/inputs',
      '/nodes/:consumerId/inputs',
      '/tasks/:taskId/bundles',
      '/bundles',
    ],

    id: '_id',
    
    schemas:
    {
      read: schemas.bundleRead,
      query: schemas.bundleQuery,
      write: schemas.bundleWrite,
    },

    accessControl: ({ taskId }, _0, _1, res) => checkTaskAccess(taskId, res),

    /**
     * Put a bundle back to be consumed again.
     * This may be done on error or timeout given that no items have been produced from this input.
     * 
     * TODO: make sure that either no data items have been emitted 
     * with the same flowId and depth or that said items are not "done" yet
     * 
     * TODO: test
     * 
     * @param param0 query
     * @returns _id
     */
    put: async ({ _id }, { consumptionId }) => 
    {
      await unconsume(_id, consumptionId);

      return _id as any;
    },

    get: async (...args) => 
    { 
      const query = args[0];

      if (query.consume)
      {
        return consumeBundles(query);
      }
      else 
      {
        const { results, total } = await getBundlesWithUnorderedItems(...args);
        
        return {
          total: total || results.length,
          // ensure that the 'items' are in the same order as the itemIds (which are in the order the consumer expects)
          // TODO: somehow order the items in the aggregation lookup stage to avoid the mess below
          results: orderItemsInBundles(results),
        };
      }
    },
  },
);

