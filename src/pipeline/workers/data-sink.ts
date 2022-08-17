

import { Type } from '@sinclair/typebox';

import { IInternalWorker } from '../internal-workers';

/** Pseudo-node that acts as a sink.  */
export default class DataSink
implements IInternalWorker
{
  readonly key = 'data-sink';

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
   * @param _ id of producer node (not used)
   * @param joinNode join node
   * @param item data item
   * @returns update result
   */
  upsertBundle()
  {
    return Promise.resolve(); 
  }
}

