
import { parseObjectId } from '@unologin/server-common/lib/general/database';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { DataItem, Node, TaskWrite } from '../src/schemas/pipeline';

import tasksApi from '../src/api/tasks';
import nodesApi from '../src/api/nodes';
import dataItemsApi from '../src/api/data-items';
import bundlesApi from '../src/api/bundles';

import { APIError } from 'express-lemur/lib/errors';
import { bundles, dataItems } from '../src/storage/database';

const userId = new ObjectId('62de9ee9ac751033dad45a62');

const mockRes = 
{
  locals: { unologin: { user: { asuId: userId.toHexString() } } },
} as any as Response;

let taskId : ObjectId;

let srcNode1 : Node;
let srcNode2 : Node;
let outNode : Node;

describe('Tasks & Nodes API', () => 
{
  it('POST /tasks creates new task and sets creator as owner', async () => 
  {
    const task : TaskWrite = 
    {
      title: 'test task',
      description: 'testing',

      params: { },
      owners: [],
    };

    taskId = parseObjectId(
    await tasksApi.post(
      null as any,
      task,
      null as any,
      mockRes,
    ) as string,
    );

    const { results } = await tasksApi.get(
      { _id: taskId },
    null as any,
    mockRes,
    );

    expect(results[0].owners)
      .toStrictEqual([userId]);
  });

  it('POST /task/:taskId/nodes creates new nodes for task', async () => 
  {
    srcNode1 = await nodesApi.post(
      { taskId },
      {
        workerId: new ObjectId(),
        inputs: [],
      },
      null as any,
      mockRes,
    ) as Node;

    expect(srcNode1.taskId).toStrictEqual(taskId);
    expect(srcNode1._id).toBeDefined();

    srcNode2 = await nodesApi.post(
      { taskId },
      {
        workerId: new ObjectId(),
        inputs: [],
      },
      null as any,
      mockRes,
    ) as Node;

    expect(srcNode2.taskId).toStrictEqual(taskId);
    expect(srcNode2._id).toBeDefined();

    outNode = await nodesApi.post(
      { taskId },
      {
        workerId: new ObjectId(),
        inputs: [
          {
            nodeId: srcNode1._id,
            output: 'out0',
          },
          {
            nodeId: srcNode2._id,
            output: 'out0',
          },
        ],
      },
      null as any,
      mockRes,
    ) as Node;

    expect(outNode.taskId).toStrictEqual(taskId);
    expect(outNode._id).toBeDefined();
  });
});

describe('DataItems API', () => 
{
  it('POST with done=true creates new data-item and bundle.', async () => 
  {
    const item = await dataItemsApi.post(
      { nodeId: srcNode2._id, taskId },
      {
        data: 'b1data2',
        done: true,
        bundle: 'b1',
        output: 'out0',
      }, 
      null as any,
      mockRes,
    ) as DataItem;

    expect(
      await dataItems.countDocuments(),
    ).toBe(1);

    const { results: [bundle] } = await bundlesApi.get(
      { consumerId: outNode._id, taskId, bundle: 'b1' },
      null as any,
      mockRes,
    );

    expect(bundle.itemIds).toStrictEqual([item._id]);

    expect(bundle.done).toBe(false);

    expect(bundle.bundle).toBe('b1');

    expect(bundle.items[0].data).toBe('b1data2');
  });

  it('POST by same {nodeId,bundle,output} not allowed', async () => 
  {
    await expect(
      () => dataItemsApi.post(
        { nodeId: srcNode2._id, taskId },
        {
          data: 'b1data3',
          done: true,
          bundle: 'b1',
          output: 'out0',
        }, 
        null as any,
        mockRes,
      ),
    ).rejects.toBeInstanceOf(APIError);
  });

  it('POST by same {nodeId,bundle}, different output allowed', async () => 
  {
    const bundlesCollection = await bundles.find({}).toArray();

    await dataItemsApi.post(
      { nodeId: srcNode2._id, taskId },
      {
        data: 'b1data3',
        done: true,
        bundle: 'b1',
        // output out1 is not connected to anything
        output: 'out1',
      }, 
      null as any,
      mockRes,
    );

    // should not appear in any bundles => no new bundles
    expect(await bundles.find({}).toArray())
      .toStrictEqual(bundlesCollection);

    
  });

  it(
    'POST with done=true + different bundle creates new data-item and bundle.',
    async () => 
    {
      const item = await dataItemsApi.post(
        { nodeId: srcNode1._id, taskId },
        {
          data: 'b2data1',
          done: true,
          bundle: 'b2',
          output: 'out0',
        }, 
      null as any,
      mockRes,
      ) as DataItem;

      expect(
        await dataItems.countDocuments(),
      ).toBe(3);

      const bundle = await bundles.findOne({ itemIds: item._id });

      expect(bundle.itemIds).toStrictEqual([item._id]);

      expect(bundle.done).toBe(false);

      expect(bundle.bundle).toBe('b2');
    },
  );

  it('POST with done=true creates new data-item, finishes bundle.', async () => 
  {
    const item = await dataItemsApi.post(
      { nodeId: srcNode1._id, taskId },
      {
        data: 'b1data1',
        done: true,
        bundle: 'b1',
        output: 'out0',
      }, 
      null as any,
      mockRes,
    ) as DataItem;

    expect(
      await dataItems.countDocuments(),
    ).toBe(4);

    const { results: [bundle] } = await bundlesApi.get(
      { consumerId: outNode._id, taskId, bundle: 'b1' },
      null as any,
      mockRes,
    );

    expect(bundle.itemIds.length).toBe(2);
    expect(bundle.itemIds[0]).toStrictEqual(item._id);

    expect(bundle.done).toBe(true);

    expect(bundle.bundle).toBe('b1');
  });
});

describe('Bundles API', () => 
{
  // if this test fails, it's likely the fault of the dataItems API
  it('bundle is available to consumer node', async () => 
  {
    const { results, total } = await bundlesApi.get(
      { consumerId: outNode._id, taskId, done: true },
      null as any,
      mockRes,
    );

    expect(total).toBe(1);

    const bundle = results[0];

    expect(bundle.done).toBe(true);

    // check that data is in correct order
    expect(
      bundle.items.map(({ data }) => data),
    ).toStrictEqual(['b1data1', 'b1data2']);
  });

  it(
    // should return the same bundles as non have been consumed yet
    'first GET with consume=true returns same bundles as consume=false', 
    async () => 
    {
      const query = { consumerId: outNode._id, taskId, done: true, limit: 1 };

      const { results: getResults } = await bundlesApi.get(
        query,
        null as any,
        mockRes,
      );

      const { results: consumeResults } = await bundlesApi.get(
        {
          ...query,
          consume: true,
        },
        null as any,
        mockRes,
      );

      expect(
        // removing consume related fields because those will change
        consumeResults.map(
        // eslint-disable-next-line
        ({ consumedAt, ...b }) => b,
        ),
      ).toStrictEqual(getResults);

      expect(consumeResults.length).toBe(query.limit);
    },
  );
});
