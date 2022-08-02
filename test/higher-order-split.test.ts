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
      internalWorker: 'split',
      inputs: 
      [
        {
          inputChannel: 'in',
          nodeId: sourceNode.nodeId,
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
        nodeId: sourceNode.nodeId,
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
    // emit first dataitem
    // this will emit a SINGLE item containnig the array
    await sourceNode.emit(
      [
        'f1data1',
        'f1data2',
        'f1data3',
      ],
    );

    const inputBundles = await inspectNode.consume();
    
    for (const bundle of inputBundles)
    {
      console.log(bundle.items);
      console.log(bundle.items[0].flowStack);
    }

    expect(inputBundles.length).toBe(3);
  },
);
