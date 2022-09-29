
import { ObjectId } from 'mongodb';
import { createNode } from './api-util';
import dataItemsApi from '../../src/api/data-items';
import { DataItem } from '../../src/pipeline/schemas';

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
        workerId: 'data-source',
      },
    );

    return this;
  }

  /**
   * @returns nodeId
   */
  getNodeId()
  {
    if (this.nodeId)
    {
      return this.nodeId;
    }
    else 
    {
      throw new Error(
        'Please await sourceNode.register() before requesting nodeId.',
      );
    }
  }

  /**
   * Emit a single item containing the data.
   * @param data data
   * @param flowId optional flowId
   * @returns Promise
   */
  async emit(data : any, flowId?: string) : Promise<DataItem>
  {
    return (dataItemsApi as any).post(
      { nodeId: this.getNodeId(), taskId: this.taskId },
      {
        flowId,
        consumptionId: null,
        data: data,
        outputChannel: 'data',
        done: true,
      },
      null as any,
      null as any,
    );
  }
}
