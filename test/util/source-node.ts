
import { ObjectId } from 'mongodb';
import { createNode } from './api-util';
import dataItemsApi from '../../src/api/data-items';

/** */
export default class SourceNode
{
  nodeId: ObjectId | null = null;

  /** */
  constructor(private taskId : ObjectId) {}

  /** @returns this */
  async register()
  {
    this.nodeId = await createNode(
      this.taskId,
      {
        internalWorker: 'data-source',
      },
    );

    return this;
  }

  /**
   * Emit a single item containing the data.
   * @param data data
   * @returns Promise
   */
  async emit(data : any)
  {
    return dataItemsApi.post(
      { nodeId: this.nodeId, taskId: this.taskId },
      {
        data: data,
        outputChannel: 'data',
        done: true,
      },
      null as any,
      null as any,
    );
  }
}
