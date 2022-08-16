
import { Type } from '@sinclair/typebox';
import { objectId } from '@unologin/server-common/lib/schemas/general';
import { ObjectId } from 'mongodb';
import { postDataItem } from '../../api/data-items';
import * as schemas from '../schemas';
import { IInternalWorker } from '../internal-workers';

/** Joins items that have been split using the Split node.  */
export default class Join
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

  readonly params =
  {
    splitNodeId: 
    {
      schema: objectId,
      description: 'Split node whose outputs to join.',
    },
  };

  /**
   * Joins items whose flow originated in the split node back together.
   * TODO: join items in same order as they have been emitted by split.
   * 
   * @param _ id of producer node (not used)
   * @param joinNode join node
   * @param item data item
   * @returns update result
   */
  async upsertBundle(
    _ : ObjectId,
    joinNode : schemas.Node,
    item : schemas.DataItem,
  )
  {
    // pop flowstack and use flowId used before last split
    const poppedFlow = item.flowStack.splice(
      item.flowStack.findIndex(
        ({ splitNodeId }) => 
          joinNode.params?.splitNodeId.equals(splitNodeId),
      ),
      1,
    )[0];
    
    const dataItem : schemas.DataItemWrite = 
    {
      flowId: poppedFlow.flowId,
      // item.flowStack has been altered by splice above
      flowStack: item.flowStack,
      outputChannel: Object.keys(this.outputs)[0],
      data: item.data,
      autoDoneAfter: poppedFlow.numEmitted,
      done: false,
    };

    return postDataItem(
      {
        taskId: item.taskId,
        nodeId: joinNode._id,
      },
      dataItem,
    );
  }
}
