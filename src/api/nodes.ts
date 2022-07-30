
import {
  objectId,
} from '@unologin/server-common/lib/schemas/general';

import {
  collectionToGetHandler, defaultSort, removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { Type, Static } from '@unologin/typebox-extended/typebox';
import { badRequest, notFound } from 'express-lemur/lib/errors';

import { assert404, resource } from 'express-lemur/lib/rest/rest-router';
import { Collection } from 'mongodb';

import { checkTaskAccess } from '../middleware/resource-access';

import * as schemas from '../schemas/pipeline';
import { nodes, workers } from '../storage/database';
import { simplePatch } from '../util/rest-util';

const nodeQuery = Type.Object(
  {
    _id: Type.Optional(objectId),
    taskId: objectId,
  },
);

type NodeQuery = Static<typeof nodeQuery>;

/**
 * 
 * @param inputs node inputs
 * @param worker worker for the provided node
 * @returns void
 * @throws bad request
 */
async function validateNodeInputs(
  inputs : schemas.NodeWrite['inputs'],
  worker : schemas.Worker,
)
{
  const inputChannels = inputs.map(
    ({ inputChannel }) => inputChannel,
  );

  const hasDuplicates = 
    Object.keys(
      Object.fromEntries(inputChannels.map((c) => [c, c])),
    ).length !== inputChannels.length
  ;

  if (hasDuplicates)
  {
    throw badRequest()
      .msg('Duplicate inputs.');
  }

  for (const channel of inputChannels)
  {
    if (!(channel in worker.inputs))
    {
      throw badRequest()
        .msg('Invalid input channel.')
        .data({ inputs: worker.inputs, inputChannel: channel });
    }
  }

  const inputNodeIds = inputs.map(({ nodeId }) => nodeId);

  const inputNodes = await nodes.find(
    { _id: { $in: inputNodeIds } },
  ).toArray();

  if (inputNodes.length !== inputs.length)
  {
    const invalidInputNodes = inputNodeIds.filter(
      (nodeId) => !inputNodes.find(({ _id }) => _id === nodeId ),
    );

    throw badRequest()
      .msg('Input node(s) not found.')
      .data({ invalidInputNodes })
    ;
  }
}

export default resource(
  {
    route: '/tasks/:taskId/nodes',

    id: '_id',

    schemas: 
    {
      read: schemas.nodeRead,
      write: schemas.nodeWrite,
      query: nodeQuery,
    },

    accessControl: ({ taskId }, _0, _1, res) => checkTaskAccess(taskId, res),

    get: collectionToGetHandler<NodeQuery, typeof schemas.nodeRead>(
      nodes as Collection<any>,
      schemas.nodeRead,
      (q) => removeUndefined(q),
      defaultSort,
      [
        {
          $lookup:
          {
            from: 'workers',
            as: 'worker',
            localField: 'workerId',
            foreignField: '_id',
          },
        },
        {
          $addFields:
          {
            worker: { $arrayElemAt: ['$worker', 0] },
          },
        },
      ],
    ),

    post: async ({ taskId }, node) => 
    {
      const worker = assert404(
        await workers.findOne({ _id: node.workerId }),
      );

      await validateNodeInputs(node.inputs, worker);

      const doc = { ...node, taskId, createdAt: new Date() };

      const insertResult = await nodes.insertOne(doc);

      return {
        ...doc,
        _id: insertResult.insertedId,
        worker,
      };
    },

    patch: async ({ taskId, _id }, newNode) => 
    {
      if ('inputs' in newNode)
      {
        let workerId = newNode.workerId;

        if (!workerId)
        {
          workerId = (await nodes.findOne({ _id, taskId })).workerId;
        }

        const worker = assert404(
          await workers.findOne({ _id: workerId }),
        );
  
        await validateNodeInputs(newNode.inputs, worker); 
      }

      return simplePatch<schemas.NodeRead>(nodes, { taskId, _id }, newNode);
    },

    delete: async ({ taskId, _id }) => 
    {
      const [deleteResult] = await Promise.all(
        [
          // delete the node
          nodes.deleteOne({ taskId, _id }),
          // delete all connections to the node TODO: test
          nodes.updateMany(
            { 'inputs.nodeId': _id },
            { $pull: { inputs: { nodeId: _id } } },
          ),
        ],
      );

      if (deleteResult.deletedCount !== 1)
      {
        throw notFound()
          .msg('Node not found')
          .data({ _id, taskId })
        ;
      }
    },
  },
);
