
import { Type } from '@sinclair/typebox';
import { ObjectId } from 'mongodb';
import { postDataItem } from '../../api/data-items';
import * as schemas from '../../schemas/pipeline';
import { IInternalWorker } from '../internal-workers';

/** Joins items that have been split using the Split node.  */
export default class Split
implements IInternalWorker
{
  readonly title = 'Join';

  readonly description = 
    'Joins items that have been split using the Split node.'
  ;
  
  readonly inputs = 
  {
    'in': { schema: Type.Any(), description: '' },
  };

  readonly outputs = 
  {
    'out': 
    {
      schema: Type.Any(), 
      description: 'Array of multiple input items per output item.',
    },
  };

  readonly params = {};

  /**
   * Re-emits each element in items.data as its own item.
   * 
   * TODO: it probably makes sense to just insert a bunch of bundles using bulk operations
   * 
   * @param _ id of producer node (not used)
   * @param splitNode split node
   * @param item data item
   * @returns update result
   */
  upsertBundle(
    _ : ObjectId,
    splitNode : schemas.Node,
    item : schemas.DataItem,
  )
  {
    return postDataItem(
      {
        taskId: item.taskId,
        nodeId: splitNode._id,
      },
      {
        // pop flowstack and use flowId used before last split
        flowId: item.flowStack.pop(),
        flowStack: item.flowStack,
        taskId: item.taskId,
        nodeId: splitNode._id,
        outputChannel: Object.keys(this.outputs)[0],
        done: true,
        data: item.data,
      },
    );
  }
}
