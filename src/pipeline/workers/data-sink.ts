

import { Type } from '@sinclair/typebox';
import { bundles } from '../../storage/database';
import * as schemas from '../schemas';
import { IInternalWorker } from '../internal-workers';
import { ObjectId } from 'mongodb';

/** Pseudo-node that acts as a sink.  */
export default class DataSink
implements IInternalWorker
{
  readonly _id = 'data-sink';

  readonly title = 'Sink';

  readonly description = 
    'Pseudo-node that acts as a sink.'
  ;
  
  readonly inputs = 
  {
    in: { schema: Type.Any(), description: '' },
  };

  readonly outputs = {};

  readonly params = {};

  /**
   * 
   * @param producerId producerId
   * @param consumer consumer
   * @param item item
   * @returns Promise
   */
  async upsertBundle(
    producerId : ObjectId,
    consumer : schemas.Node,
    item : schemas.DataItem,
  )
  {
    await bundles.insertOne(
      {
        lowerFlowIds: item.flowStack.map(({ flowId }) => flowId),
        createdAt: new Date(),
        inputItems: [
          {
            position: 0,
            nodeId: producerId,
            inputChannel: 'in',
            outputChannel: item.outputChannel,
            itemId: item._id,
          },  
        ],
        consumerId: consumer._id,
        done: true,
        flowId: item.flowId || new ObjectId(),
        flowStack: item.flowStack,
        taskId: item.taskId,
        numAvailable: 1,
        numTaken: 0,
        depth: 0,
        allTaken: false,
        consumptions: [],
      },
    );
  }
}

