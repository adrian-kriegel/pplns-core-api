/**
 * Tests for queue behavior of the bundles API.
 */

import { ObjectId } from 'mongodb';
import { bundles } from '../src/storage/database';

import bundlesApi from '../src/api/bundles';
import { BundleRead } from '../src/pipeline/schemas';

import { mockRes } from './util/pipeline-setups';

const flowId1 = new ObjectId('f1de9ee9ac751033dad45a62');
const flowId2 = new ObjectId('f2de9ee9ac751033dad45a62');

const workerId = 'some-worker-id';
const consumerId = new ObjectId('62de9ee9ac751033dad45a64');
const taskId = new ObjectId('62de9ee9ac751033dad45a65');

beforeAll(async () => 
{
  await bundles.insertMany(
    [
      {
        depth: 0,
        flowId: flowId1,
        flowStack: [],
        consumerId,
        taskId,
        createdAt: new Date(),
        done: true,
        inputItems: [],
        workerId,
        numAvailable: 1,
        numTaken: 0,
        allTaken: false,
        consumptions: [],
      },
      {
        depth: 0,
        flowId: flowId2,
        flowStack: [],
        consumerId,
        taskId,
        createdAt: new Date(),
        done: true,
        inputItems: [],
        workerId,
        numAvailable: 1,
        numTaken: 0,
        allTaken: false,
        consumptions: [],
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

      // reset consumptions as they will be changed after consume=true 
      consumeResults.forEach(
        (r) =>
        {
          r.consumptions = [];
          delete r.consumptionId;
        },
      );

      expect(consumeResults).toStrictEqual(
        getResults.map((r) => ({ ...r, numTaken: r.numTaken + 1 })),
      );

      expect(consumeResults.length).toBe(2);
    },
  );

  it(
    'GET with consume=true will make the bundle unavailable afterwards',
    async ()=> 
    {
      // reset all bundles to be unconsumed
      await bundles.updateMany(
        { },
        { 
          $set: { numTaken: 0, allTaken: false },
        },
      );

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
