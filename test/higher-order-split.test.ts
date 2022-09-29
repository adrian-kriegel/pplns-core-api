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
import { BundleRead, DataItem } from '../src/pipeline/schemas';
import { createNode } from './util/api-util';
import { InspectNode } from './util/inspect-node';

import SourceNode from './util/source-node';

/**
 * Sets up the above scenario.
 * @param arrayFirst whether the array or its elements come first in the inspect node inputs
 * @returns [sourceNode, inspectNode]
 */
const setup = async (
  arrayFirst: boolean,
) : Promise<[SourceNode, InspectNode]> => 
{
  const taskId = new ObjectId();

  const sourceNode = await new SourceNode(taskId)
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

  const inputs = [
    {
      nodeId: splitId,
      outputChannel: 'out',
    },
    {
      nodeId: sourceNode.getNodeId(),
      outputChannel: 'data',
    },
  ];

  if (arrayFirst)
  {
    inputs.reverse();
  }

  const inspectNode = new InspectNode(
    taskId,
    inputs,
  );

  await inspectNode.register();

  return [
    sourceNode,
    inspectNode,
  ];
};

/**
 * @param inputItems inputItems from the bunlde
 * @param items items from the bundle
 * @returns items in same order as inputItems
 */
function sortBundleItems(
  inputItems : BundleRead['inputItems'],
  items : DataItem[],
) : DataItem[]
{
  return inputItems.map(
    ({ itemId }) => 
    {
      const item = items.find(({ _id }) => (''+_id) === (''+itemId));

      if (!item)
      {
        throw new Error('Could not find item.');
      }

      return item;
    },
  );
}

const testHigherOrderSplit = async (arrayFirst : boolean) => 
{
  const [sourceNode, inspectNode] = await setup(arrayFirst);

  const inputData = [
    'f1data1',
    'f1data2',
    'f1data3',
  ];

  // emit first dataitem
  // this will emit a SINGLE item containig the array which is then split in the split node
  await sourceNode.emit(
    inputData,
    'data',
  );

  const inputBundles = await inspectNode.getInputs();
  
  expect(inputBundles.length).toBe(3);
  
  const data = inputBundles.map(
    (bundle) => sortBundleItems(
      bundle.inputItems,
      bundle.items,
    ).map((item) => item.data),
  );
  
  // sorts the data because bundles themselves may come in different orders
  // which is expected
  const sortedData = inputData.map(
    arrayFirst ? 
      (str) => data.find(([, [item1]]) => item1 === str) :
      (str) => data.find(([[item1]]) => item1 === str),
  );

  const expectedData = inputData.map(
    // nested array format is expected because sortedData = [item1.data, item2.data][]
    // and item.data is always an array
    (str) => arrayFirst ? 
      [inputData, [str]] :
      [[str], inputData]
    ,
  );

  expect(sortedData).toStrictEqual(expectedData);
};

describe(
  'Input items from different split levels are bundled correctly.', 
  () => 
  {
    it('When array comes first', () => 
    {
      return testHigherOrderSplit(true);
    });

    it('When array comes last', () => 
    {
      return testHigherOrderSplit(false);
    });
  },
);
