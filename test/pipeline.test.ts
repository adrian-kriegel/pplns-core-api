
import { parseObjectId } from '@unologin/server-common/lib/general/database';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { DataItem, Node, TaskWrite } from '../src/schemas/pipeline';

import tasksApi from '../src/api/tasks';
import nodesApi from '../src/api/nodes';
import dataItemsApi from '../src/api/data-items';
import bundlesApi from '../src/api/bundles';

import { bundles, dataItems, workers } from '../src/storage/database';
import { APIError } from 'express-lemur/lib/errors';

const userId = new ObjectId('62de9ee9ac751033dad45a62');

const mockRes = 
{
  locals: { unologin: { user: { asuId: userId.toHexString() } } },
} as any as Response;

let taskId : ObjectId;
let workerId : ObjectId;

const flowId1 = new ObjectId('f1de9ee9ac751033dad45a62');
const flowId2 = new ObjectId('f2de9ee9ac751033dad45a62');

let srcNode1 : Node;
let srcNode2 : Node;
let outNode : Node;

beforeAll(async () => 
{
  const dataType = { description: '', schema: {} };

  const result = await workers.insertOne(
    {
      createdAt: new Date(),

      title: '',
      description: '',

      inputs: 
      {
        in0: dataType,
        in1: dataType,
      },
      outputs:
      {
        out0: dataType,
        out1: dataType,
      },
      params: {},
    },
  );

  workerId = result.insertedId;
});

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
        workerId,
        inputs: [],
        position: { x: 0, y: 0 },
      },
      null as any,
      mockRes,
    ) as Node;

    expect(srcNode1.taskId).toStrictEqual(taskId);
    expect(srcNode1._id).toBeDefined();

    srcNode2 = await nodesApi.post(
      { taskId },
      {
        workerId,
        inputs: [],
        position: { x: 0, y: 0 },
      },
      null as any,
      mockRes,
    ) as Node;

    expect(srcNode2.taskId).toStrictEqual(taskId);
    expect(srcNode2._id).toBeDefined();

    outNode = await nodesApi.post(
      { taskId },
      {
        workerId,
        position: { x: 0, y: 0 },
        inputs: [
          {
            nodeId: srcNode1._id,
            outputChannel: 'out0',
            inputChannel: 'in1',
          },
          {
            nodeId: srcNode2._id,
            outputChannel: 'out0',
            inputChannel: 'in0',
          },
        ],
      },
      null as any,
      mockRes,
    ) as Node;

    expect(outNode.taskId).toStrictEqual(taskId);
    expect(outNode._id).toBeDefined();
  });

  it('POST /task/:taskId/nodes throws for duplicate inputs', async () => 
  {
    await expect(
      () => nodesApi.post?.(
        { taskId },
        {
          workerId,
          position: { x: 0, y: 0 },
          inputs: [
            {
              nodeId: srcNode1._id,
              outputChannel: 'out0',
              inputChannel: 'in0',
            },
            {
              nodeId: srcNode2._id,
              outputChannel: 'out0',
              inputChannel: 'in0',
            },
          ],
        },
      null as any,
      mockRes,
      ),
    ).rejects.toBeInstanceOf(APIError);
  });
});

describe('DataItems API', () => 
{
  it('POST with done=true creates new data-item and bundle.', async () => 
  {
    const item = await dataItemsApi.post(
      { nodeId: srcNode2._id, taskId },
      {
        data: ['b1data2'],
        done: true,
        flowId: flowId1,
        outputChannel: 'out0',
      }, 
      null as any,
      mockRes,
    ) as DataItem;

    expect(
      await dataItems.countDocuments(),
    ).toBe(1);

    const { results: [bundle] } = await bundlesApi.get(
      { consumerId: outNode._id, taskId, flowId: flowId1 },
      null as any,
      mockRes,
    );

    expect(bundle.itemIds).toStrictEqual([item._id]);

    expect(bundle.done).toBe(false);

    expect(bundle.flowId).toStrictEqual(flowId1);

    expect(bundle.items[0].data).toStrictEqual(['b1data2']);
  });

  it('POST with same {nodeId,bundle,output} will append data', async () => 
  {
    await dataItemsApi.post(
      { nodeId: srcNode2._id, taskId },
      {
        data: ['pushtest'],
        done: false,
        flowId: flowId1,
        // not connected so won't interfere with other bundles and items
        outputChannel: 'out3',
      }, 
      null as any,
      mockRes,
    );

    const item = await dataItemsApi.post(
      { nodeId: srcNode2._id, taskId },
      {
        data: ['pushtest2'],
        done: true,
        flowId: flowId1,
        // not connected so won't interfere with other bundles and items
        outputChannel: 'out3',
      }, 
      null as any,
      mockRes,
    ) as DataItem;

    await expect(
      () => dataItemsApi.post(
        { nodeId: srcNode2._id, taskId },
        {
          data: ['pushtest3'],
          done: true,
          flowId: flowId1,
          // not connected so won't interfere with other bundles and items
          outputChannel: 'out3',
        }, 
        null as any,
        mockRes,
      ),
      'Should not be able to POST after data item is "done".',
    ).rejects.toBeInstanceOf(APIError);

    expect(item.data).toStrictEqual(['pushtest', 'pushtest2']);

    // delete so it won't mess with the following tests
    await dataItems.deleteOne({ _id: item._id });
  });

  it('POST by same {nodeId,bundle}, different output allowed', async () => 
  {
    const bundlesCollection = await bundles.find({}).toArray();

    await dataItemsApi.post(
      { nodeId: srcNode2._id, taskId },
      {
        data: ['b1data3'],
        done: true,
        flowId: flowId1,
        // output out1 is not connected to anything
        outputChannel: 'out1',
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
          data: ['b2data1'],
          done: true,
          flowId: flowId2,
          outputChannel: 'out0',
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

      expect(bundle.flowId).toStrictEqual(flowId2);
    },
  );

  it('POST with done=true creates new data-item, finishes bundle.', async () => 
  {
    const item = await dataItemsApi.post(
      { nodeId: srcNode1._id, taskId },
      {
        data: ['b1data1'],
        done: true,
        flowId: flowId1,
        outputChannel: 'out0',
      }, 
      null as any,
      mockRes,
    ) as DataItem;

    expect(
      await dataItems.countDocuments(),
    ).toBe(4);

    const { results: [bundle] } = await bundlesApi.get(
      { consumerId: outNode._id, taskId, flowId: flowId1 },
      null as any,
      mockRes,
    );

    expect(bundle.itemIds.length).toBe(2);
    expect(bundle.itemIds[0]).toStrictEqual(item._id);

    expect(bundle.done).toBe(true);

    expect(bundle.flowId).toStrictEqual(flowId1);
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
    ).toStrictEqual([['b1data1'], ['b1data2']]);
  });
});
