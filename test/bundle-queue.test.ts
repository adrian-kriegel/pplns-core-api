
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { bundles } from '../src/storage/database';

import bundlesApi from '../src/api/bundles';
import { BundleRead } from '../src/schemas/pipeline';

const userId = new ObjectId('62de9ee9ac751033dad45a62');

const mockRes = 
{
  locals: { unologin: { user: { asuId: userId.toHexString() } } },
} as any as Response;


const workerId = new ObjectId('62de9ee9ac751033dad45a63');
const consumerId = new ObjectId('62de9ee9ac751033dad45a64');
const taskId = new ObjectId('62de9ee9ac751033dad45a65');

beforeAll(async () => 
{
  await bundles.insertMany(
    [
      {
        bundle: 'b1',
        consumerId,
        taskId,
        createdAt: new Date(),
        done: true,
        itemIds: [],
        workerId,
      },
      {
        bundle: 'b2',
        consumerId,
        taskId,
        createdAt: new Date(),
        done: true,
        itemIds: [],
        workerId,
      },
    ],
  );
});

describe('Bundle API queue system', () => 
{
  it(
    // should return the same bundles as non have been consumed yet
    'first GET with consume=true returns same bundles as consume=false', 
    async () => 
    {
      const query = { consumerId, taskId, done: true };

      const { results: getResults } = await bundlesApi.get(
        query,
        null as any,
        mockRes,
      );

      let consumeResults : BundleRead[] = [];

      for (let i = 0; i < getResults.length; i++)
      {
        const { results } = await bundlesApi.get(
          {
            ...query,
            consume: true,
          },
          null as any,
          mockRes,
        );
        
        consumeResults = [...consumeResults, ...results];
      }

      // dirty way of making sure the order is the same
      consumeResults = getResults.map(
        ({ _id }) => consumeResults.find((bundle) => bundle._id.equals(_id)),
      );

      expect(
        // removing consume related fields because those will change
        consumeResults.map(
        // eslint-disable-next-line
        ({ consumedAt, ...b }) => b,
        ),
      ).toStrictEqual(getResults);

      expect(consumeResults.length).toBe(2);
    },
  );

  it(
    'GET with consume=true will make the bundle unavailable afterwards',
    async ()=> 
    {
      // reset all bundles to be unconsumed
      await bundles.updateMany({ }, { $unset: { consumedAt: 1 } });

      const query = 
      {
        consumerId, 
        taskId,
        limit: 1,
        consume: true,
      };

      const { results: result1 } = await bundlesApi.get(
        query,
        null as any,
        mockRes,
      );

      const { results: result2 } = await bundlesApi.get(
        query,
        null as any,
        mockRes,
      );

      expect(result1[0]._id == result2[0]._id)
        .toBe(false);
    },
  );
});
