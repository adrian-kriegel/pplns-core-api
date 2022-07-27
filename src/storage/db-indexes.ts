
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
    { inputs: 1 },
  ],
  dataItems:
  [
    { taskId: 1 },
    {
      nodeId: 1,
      taskId: 1,
      bundle: 1,
      output: 1,
      $options: { unique: true },
    },
  ],
  bundles:
  [
    { itemIds: 1 },
    { taskId: 1 },
    { bundle: 1 },
    { done: 1 },
    { consumerId: 1 },
    { consumedUpdateId: 1 },
  ],
};

export default indexes;
