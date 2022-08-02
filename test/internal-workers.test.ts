
import { Response } from 'express';

import nodesApi from '../src/api/nodes';
import dataItemsApi from '../src/api/data-items';
import bundlesApi from '../src/api/bundles';
import { ObjectId } from 'mongodb';
import { NodeRead } from '../src/schemas/pipeline';
import { workers } from '../src/storage/database';

const taskId = new ObjectId('62de9ee9ac751033dad45a62');

const userId = new ObjectId('62de9ee9ac751033dad45a62');

const mockRes = 
{
  locals: { unologin: { user: { asuId: userId.toHexString() } } },
} as any as Response;

let inspectWorkerId;

let dataSrcNodeId : ObjectId;
let splitNodeId : ObjectId;
let inspect1NodeId : ObjectId;
let joinNodeId : ObjectId;
let inspect2NodeId : ObjectId;

const addInspectNode = async (inputNodeId : ObjectId) => 
  ((await nodesApi.post?.(
    {
      taskId,
    },
    {
      workerId: inspectWorkerId,
      inputs: 
      [
        {
          nodeId: inputNodeId,
          outputChannel: 'out',
          inputChannel: 'in',
        },
      ],
      position: { x: 0, y: 0 },
    },
    null as any,
    mockRes,
  )) as NodeRead)._id
;

beforeAll(async () => 
{
  inspectWorkerId = (await workers.insertOne(
    {
      title: '',
      description: '',
      createdAt: new Date(),
      inputs:
      {
        'in': { schema: {}, description: '' },
      },
      outputs:
      {
        'out': { schema: {}, description: '' },
      },
      params: {},
    },
  )).insertedId;
});

describe('DataSource node', () => 
{
  it('Can be created like any other node.', async () => 
  {
    const { _id } = await nodesApi.post?.(
      {
        taskId,
      },
      {
        internalWorker: 'data-source',
        inputs: [],
        position: { x: 0, y: 0 },
      },
      null as any,
      mockRes,
    ) as NodeRead;

    dataSrcNodeId = _id;
  });
});

describe('Split node.', () => 
{
  it('Can be created like any other node.', async () => 
  {
    const { _id } = await nodesApi.post?.(
      {
        taskId,
      },
      {
        internalWorker: 'split',
        inputs: 
        [
          {
            nodeId: dataSrcNodeId,
            outputChannel: 'data',
            inputChannel: 'in',
          },
        ],
        position: { x: 0, y: 0 },
      },
      null as any,
      mockRes,
    ) as NodeRead;

    splitNodeId = _id;
  });
});

describe('Join node.', () => 
{
  it('Can be created like any other node.', async () => 
  {
    inspect1NodeId = await addInspectNode(splitNodeId);

    const { _id } = await nodesApi.post?.(
      {
        taskId,
      },
      {
        internalWorker: 'join',
        inputs: 
        [
          {
            nodeId: inspect1NodeId,
            outputChannel: 'out',
            inputChannel: 'in',
          },
        ],
        params: { splitNodeId: splitNodeId },
        position: { x: 0, y: 0 },
      },
      null as any,
      mockRes,
    ) as NodeRead;

    joinNodeId = _id;

    inspect2NodeId = await addInspectNode(joinNodeId);
  });
});

describe('DataSink node.', () => 
{
  it('Can be created like any other node.', async () => 
  {
    await nodesApi.post?.(
      {
        taskId,
      },
      {
        internalWorker: 'data-sink',
        inputs: 
        [
          {
            nodeId: inspect2NodeId,
            outputChannel: 'out',
            inputChannel: 'in',
          },
        ],
        position: { x: 0, y: 0 },
      },
      null as any,
      mockRes,
    ) as NodeRead;
  });
});

describe('Split node', () => 
{
  it('Splits input data array into individual items.', async () => 
  {
    // post data from source node 
    await dataItemsApi.post(
      { nodeId: dataSrcNodeId, taskId },
      {
        data: 
        [
          ['f1data1'],
          ['f1data2'],
        ],
        done: true,
        outputChannel: 'data',
      },
      null as any,
      mockRes,
    );

    // post another item
    await dataItemsApi.post(
      { nodeId: dataSrcNodeId, taskId },
      {
        data: 
        [
          ['f2data1'],
          ['f2data2'],
          ['f2data3'],
        ],
        done: true,
        outputChannel: 'data',
      },
      null as any,
      mockRes,
    );

    // find all items produced by the split node
    const { results: inputBundles, total } = await bundlesApi.get?.(
      { taskId, consumerId: inspect1NodeId },
      null as any,
      mockRes,
    );

    expect(total).toBe(5);
    expect(inputBundles.length).toBe(5);

    expect(
      // bundles are in no particular order, so sort() is required
      inputBundles.map(({items}) => items[0].data[0]).sort(),
    ).toStrictEqual([
      'f1data1',
      'f1data2',
      'f2data1',
      'f2data2',
      'f2data3',
    ]);

    // simply re-emit the data from the inspect node

    for (const bundle of inputBundles)
    {
      await dataItemsApi.post(
        { nodeId: inspect1NodeId, taskId },
        {
          // each bundle has one item with one data point
          data: [bundle.items[0].data[0]],
          done: true,
          outputChannel: 'out',
          flowId: bundle.flowId,
          flowStack: bundle.items[0].flowStack,
        },
        null as any,
        mockRes,
      );
    }
  });
});

describe('Join node', () => 
{
  it('Joins items back into their original shape', async () => 
  {
    // find all items produced by the join node
    const { results: inputBundles, total } = await bundlesApi.get?.(
      { taskId, consumerId: inspect2NodeId },
      null as any,
      mockRes,
    );

    expect(total).toBe(2);
    expect(inputBundles.length).toBe(2);

    const [bundle1, bundle2] = inputBundles.sort(
      ({ items: a }, { items: b }) => a.length - b.length,
    );

    expect(bundle1.items[0].data.sort()).toStrictEqual(
      [
        'f1data1',
        'f1data2',
      ],
    );

    expect(bundle2.items[0].data.sort()).toStrictEqual(
      [
        'f2data1',
        'f2data2',
        'f2data3',
      ],
    );
  });
});
