
import { Type } from '@sinclair/typebox';
import { ObjectId } from 'mongodb';
import { onItemDone } from '../../api/data-items';
import * as schemas from '../../schemas/pipeline';
import { IInternalWorker } from '../internal-workers';

/** Splits up item contents into  */
export default class Split
implements IInternalWorker
{
  readonly title = 'Split';
  readonly description = 'Splits up provided item into multiple items.';
  
  readonly inputs = 
  {
    'in': { schema: Type.Any(), description: '' },
  };

  readonly outputs = 
  {
    'out': 
    {
      schema: Type.Any(), 
      description: 'Individual elements of input.',
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
   * @param items data item
   * @returns update result
   */
  upsertBundle(
    // producerId does not matter as the split node acts as the producer
    _ : ObjectId,
    splitNode : schemas.Node,
    items : schemas.DataItem,
  )
  {
    return Promise.all(
      items.data.map(
        (data) => onItemDone(
          {
            _id: new ObjectId(),
            createdAt: items.createdAt,
            // give each item a new flowId
            flowId: new ObjectId(),
            // store the old flowId on the flow stack
            flowStack: [...items.flowStack, items.flowId],
            taskId: items.taskId,
            nodeId: splitNode._id,
            outputChannel: Object.keys(this.outputs)[0],
            done: true,
            data,
          },
        ),
      ),
    );
  }
}
