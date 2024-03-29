
import { ObjectId } from 'mongodb';
import bundlesApi from '../../src/api/bundles';
import nodesApi from '../../src/api/nodes';
import dataItemsApi from '../../src/api/data-items';

import {
  BundleQuery,
  BundleRead,
  DataItemWrite,
  NodeRead,
  Worker,
} from '../../src/pipeline/schemas';

import { workers } from '../../src/storage/database';
import { GetResponse } from 'express-lemur/lib/rest/rest-router';

const anyType = { schema: {}, description: '' };


export type BundleProcessor = (
  (bundle : BundleRead) => Promise<DataItemWrite[]> | DataItemWrite[]
);

/** "External" node that can be put inbetween nodes. */
export class InspectNode
{
  public workerId = 'inspect_worker';
  public nodeId : ObjectId | null = null;

  public inputs : Worker['inputs'];
  public outputs : Worker['outputs'];

  /**
   * @param numInputs number of inputs/outputs
   */
  constructor(
    private taskId : ObjectId,
    private nodeInputs : { nodeId: ObjectId, outputChannel: string }[],
  )
  {
    this.inputs = Object.fromEntries(nodeInputs.map(
      (_, i) => [`in${i}`, anyType],
    ));

    this.outputs = Object.fromEntries(nodeInputs.map(
      (_, i) => [`out${i}`, anyType],
    ));
  }

  /**
   * @returns nodeId
   */
  async register()
  {
    await workers.updateOne(
      {
        _id: this.workerId,
      },
      {
        $setOnInsert:
        {
          title: '',
          description: '',
          createdAt: new Date(),
          inputs: this.inputs,
          outputs: this.outputs,
          params: {},
        },
      },
      {
        upsert: true,
      },
    );

    this.nodeId = (await nodesApi.post?.(
      {
        taskId: this.taskId,
      },
      {
        workerId: this.workerId,
        inputs: this.nodeInputs.map(
          (input, i) => ({ ...input, inputChannel: `in${i}` }),
        ),
        position: { x: 0, y: 0 },
      },
      null as any,
      null as any,
    ) as NodeRead)._id;

    return this;
  }

  /**
   * @returns bundles 
   */
  async getInputs() : Promise<BundleRead[]>
  {
    return (await bundlesApi.get?.(
      { taskId: this.taskId, consumerId: this.nodeId as ObjectId },
      null as any,
      null as any,
    ) as any).results;
  }

  /**
   * @param query optional bundle query
   * @returns bundles
   */
  async consume(query : BundleQuery = {}) : Promise<BundleRead[]>
  {
    const bundles : BundleRead[] = [];

    while (bundles.length < (query.limit ?? Infinity))
    {
      const res = await bundlesApi.get?.(
        { 
          taskId: this.taskId, 
          consumerId: this.nodeId as ObjectId,
          limit: 1,
          consume: true,
          ...query,
        },
        null as any,
        null as any,
      ) as GetResponse<BundleRead>;

      if (res && res?.results.length > 0)
      {
        bundles.push(res.results[0]);
      }
      else 
      {
        break;
      }
    }

    return bundles;
  }

  /**
   * Re-emits 
   * @param processor processor
   * @returns Promise<void>
   */
  async process(
    processor : BundleProcessor = (
      (b) => b.items.map((i) => (
        { ...i, consumptionId: b.consumptionId as ObjectId }
      ))
    ), 
  )
  {
    for (const bundle of await this.getInputs())
    {
      const itemsToEmit = await processor(bundle);

      for (const item of itemsToEmit)
      {
        await dataItemsApi.post?.(
          { nodeId: this.nodeId as ObjectId, taskId: this.taskId },
          item,
          null as any,
          null as any,
        );
      }
    }
  }
}
