/**
 * Tests for the following scenario: 
 * 
 *                                            ┌────────────────────┐
 *                    ┌────────────────────┐  │                    │
 * ┌─────────────┬─┬─►│   SPLIT NODE       ├─►│Elements from Array │
 * │             │ │  │                    │  │                    │
 * │   Array     │ │  └────────────────────┘  │                    │
 * │             │ │                          │                    │
 * └─────────────┘ └─────────────────────────►│Array               │
 *                                            └────────────────────┘
 * 
 * Bundles for the output node should be made available for every element
 * in the array. This means the 'Array' item should be in multiple bundles.
 * 
 * It should act similar to:
 * 
 * let bundles = array.map((elem) => [elem, array])
 * 
 * bundles.forEach(outputNode.processBundle)
 */

import { ObjectId } from 'mongodb';
import { createNode } from './util/api-util';
import { InspectNode } from './util/inspect-node';
import SourceNode from './util/source-node';

const taskId = new ObjectId('62de9ee9ac751033dad45a62');

let sourceNode : SourceNode;
let inspectNode : InspectNode;

beforeAll(async () =>
{
  sourceNode = await new SourceNode(taskId)
    .register();

  const splitId = await createNode(
    taskId,
    {
      workerId: 'split',
      inputs: 
      [
        {
          inputChannel: 'in',
          nodeId: sourceNode.getNodeId(),
          outputChannel: 'data',
        },
      ],
    },
  );

  inspectNode = new InspectNode(
    taskId,
    [
      {
        nodeId: splitId,
        outputChannel: 'out',
      },
      {
        nodeId: sourceNode.getNodeId(),
        outputChannel: 'data',
      },
    ],
  );

  await inspectNode.register();
});

test(
  'Input items from different split levels are bundled correctly.', 
  async () => 
  {
    const inputData = [
      'f1data1',
      'f1data2',
      'f1data3',
    ];

    // emit first dataitem
    // this will emit a SINGLE item containnig the array
    await sourceNode.emit(
      inputData,
    );

    const inputBundles = await inspectNode.getInputs();

    expect(inputBundles.length).toBe(3);

    const data = inputBundles.map(
      (bundle) => bundle.items.map((item) => item.data),
    );
    
    const sortedData = inputData.map(
      (str) => data.find(([[item1]]) => item1 === str),
    );

    const expectedData = inputData.map(
      // nested array format is expected because sortedData = [item1.data, item2.data][]
      // and item.data is always an array
      (str) => [[str], inputData],
    );

    expect(sortedData).toStrictEqual(expectedData);
  },
);
