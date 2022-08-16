
import { ObjectId } from 'mongodb';
import nodesApi from '../../src/api/nodes';
import { NodeRead, NodeWrite } from '../../src/pipeline/schemas';

/**
 * @param taskId taskId
 * @param props nodeWrite
 * @returns nodeId
 */
export async function createNode(
  taskId : ObjectId,
  props : Partial<NodeWrite>,
)
{
  return (await nodesApi.post?.(
    {
      taskId,
    },
    {
      inputs: [],
      ...props,
      position: { x: 0, y: 0 },
    },
    null as any,
    null as any,
  ) as NodeRead)._id;
}
