

import { Type } from '@sinclair/typebox';

import { IInternalWorker } from '../internal-workers';

/** Pseudo-node which can act as a data source.  */
export default class DataSource
implements IInternalWorker
{
  readonly key = 'data-source';
  
  readonly title = 'Data Source';

  readonly description = 
    'Pseudo-node which can act as a data source.'
  ;
  
  readonly inputs = {};

  readonly outputs = 
  {
    data: 
    {
      schema: Type.Any(), 
      description: 'params.data',
    },
  };

  readonly params = 
  {
    data: 
    {
      description: 'Array of values to emit as items.',
      schema: Type.Array(Type.Any()),
    },
  };

  /**
   * @throws error
   * @returns void
   */
  upsertBundle() : any
  {
    throw new Error(
      'Cannot input data into data-source.',
    );
  }
}

