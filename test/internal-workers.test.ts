
import { Response } from 'express';

import dataItemsApi from '../src/api/data-items';
import bundlesApi from '../src/api/bundles';
import { ObjectId } from 'mongodb';
import { InspectNode } from './util/inspect-node';
import { createNode } from './util/api-util';

const taskId = new ObjectId('62de9ee9ac751033dad45a62');

const userId = new ObjectId('62de9ee9ac751033dad45a62');

const mockRes = 
{
  locals: { unologin: { user: { asuId: userId.toHexString() } } },
} as any as Response;

let dataSrcNodeId : ObjectId;
let splitNodeId : ObjectId;
let inspect1Node : InspectNode;
let joinNodeId : ObjectId;
let inspect2NodeId : ObjectId;

describe('DataSource node', () => 
{
  it('Can be created like any other node.', async () => 
  {
    dataSrcNodeId = await createNode(
      taskId,
      {
        workerId: 'data-source',
      },
    );
  });
});

describe('Split node.', () => 
{
  it('Can be created like any other node.', async () => 
  {
    splitNodeId = await createNode(
      taskId,
      {
        workerId: 'split',
        inputs: [
          {
            nodeId: dataSrcNodeId,
            outputChannel: 'data',
            inputChannel: 'in',
          },
        ],
      },
    );
  });
});

describe('Join node.', () => 
{
  it('Can be created like any other node.', async () => 
  {
    inspect1Node = new InspectNode(
      taskId,
      [{ nodeId: splitNodeId, outputChannel: 'out' }],
    );

    await inspect1Node.register();

    joinNodeId = await createNode(
      taskId,
      {
        workerId: 'join',
        inputs: 
        [
          {
            nodeId: inspect1Node.nodeId as ObjectId,
            outputChannel: 'out',
            inputChannel: 'in',
          },
        ],
        params: { splitNodeId: splitNodeId },
      },
    );

    inspect2NodeId = (await new InspectNode(
      taskId,
      [{ nodeId: joinNodeId, outputChannel: 'out' }],
    ).register()).nodeId as ObjectId;

  });
});

describe('DataSink node.', () => 
{
  it('Can be created like any other node.', async () => 
  {
    await createNode(
      taskId,
      {
        workerId: 'data-sink',
        inputs: 
        [
          {
            nodeId: inspect2NodeId,
            outputChannel: 'out',
            inputChannel: 'in',
          },
        ],
      },
    );
  });
});

describe('Split node', () => 
{
  it('Splits input data array into individual items.', async () => 
  {
    // post data from source node 
    await dataItemsApi.post?.(
      { nodeId: dataSrcNodeId, taskId },
      {
        data: 
        [
          ['f1data1'],
          ['f1data2'],
        ],
        done: true,
        outputChannel: 'data',
        consumptionId: null,
      },
      null as any,
      mockRes,
    );

    // post another item
    await dataItemsApi.post?.(
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
        consumptionId: null,
      },
      null as any,
      mockRes,
    );

    // find all items produced by the split node
    const { results: inputBundles, total } = await bundlesApi.get?.(
      { taskId, consumerId: inspect1Node.nodeId as ObjectId },
      null as any,
      mockRes,
    ) as any;

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

    await inspect1Node.process(
      (bundle) => [
        {
          // each bundle has one item with one data point
          data: [bundle.items[0].data[0]],
          done: true,
          outputChannel: 'out',
          flowId: bundle.flowId,
          flowStack: bundle.items[0].flowStack,
          consumptionId: bundle.consumptionId as ObjectId,
        },
      ],
    );
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
    ) as any;

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
