
import {
  CollectionIndexes,
} from '@unologin/server-common/lib/general/db-indexes';

const indexes : CollectionIndexes = 
{
  tasks:
  [
    { owners: 1 },
  ],
  nodes:
  [
    { taskId: 1 },
    {
      'inputs.outputChannel': 1,
      'inputs.nodeId': 1,
    },
  ],
  dataItems:
  [
    { taskId: 1 },
    {
      nodeId: 1,
      taskId: 1,
      flowId: 1,
      outputChannel: 1,
      $options: { unique: true },
    },
  ],
  bundles:
  [
    { 'inputItems.itemId': 1 },
    { taskId: 1 },
    { flowId: 1 },
    { done: 1 },
    { consumerId: 1 },
    { consumedAt: 1 },
    {
      consumerId: 1,
      taskId: 1,
      flowId: 1,
      depth: 1,
      $options: { unique: true },
    },
  ],
};

export default indexes;
