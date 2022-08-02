
import { Type } from '@sinclair/typebox';
import { ObjectId } from 'mongodb';
import { postDataItem } from '../../api/data-items';
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
        (data) => postDataItem(
          {
            taskId: items.taskId, 
            nodeId: splitNode._id,
          },
          {
            // create new flowId for each new data item
            flowId: new ObjectId(),

            // push old flowId into the flow stack
            flowStack: [
              ...items.flowStack,
              {
                flowId: items.flowId,
                splitNodeId: splitNode._id,
                numEmitted: items.data.length,
              },
            ],
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
