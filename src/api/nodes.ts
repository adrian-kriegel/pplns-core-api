
import {
  collectionToGetHandler, defaultSort, removeUndefined,
} from '@unologin/server-common/lib/util/rest-util';

import { badRequest, notFound } from 'express-lemur/lib/errors';

import { assert404, resource } from 'express-lemur/lib/rest/rest-router';
import { Collection } from 'mongodb';

import { checkTaskAccess } from '../middleware/resource-access';

import {
  getInternalWorker,
  IInternalWorker,
} from '../pipeline/internal-workers';

import { findWorkerForNode } from '../pipeline/worker';

import * as schemas from '../pipeline/schemas';
import { nodes } from '../storage/database';
import { simplePatch } from '../util/rest-util';


/**
 * 
 * @param inputs node inputs
 * @param worker worker for the provided node
 * @returns void
 * @throws bad request
 */
async function validateNodeInputs(
  inputs : schemas.NodeWrite['inputs'],
  worker : schemas.Worker | IInternalWorker,
)
{
  const inputChannels = inputs.map(
    ({ inputChannel }) => inputChannel,
  );

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
    route: [
      '/tasks/:taskId/nodes',
      '/nodes',
    ],

    id: '_id',

    schemas: 
    {
      read: schemas.nodeRead,
      write: schemas.nodeWrite,
      query: schemas.nodeQuery,
    },

    accessControl: async (query, _0, _1, res) => 
    {
      let taskId = query.taskId;

      if (!taskId)
      {
        const node = assert404(await nodes.findOne({ _id: query._id }));

        taskId = node.taskId;
      }

      return checkTaskAccess(taskId, res);
    },

    get: collectionToGetHandler<schemas.NodeQuery, typeof schemas.nodeRead>(
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
    ).map(
      (node) => 
      {
        return {
          ...node,
          worker: node.worker || getInternalWorker(node.workerId),
        };
      },
    ),

    post: async ({ taskId }, node) => 
    {
      const worker = await findWorkerForNode(node);

      await validateNodeInputs(node.inputs, worker);

      const doc = { ...node, taskId, createdAt: new Date() };

      const insertResult = await nodes.insertOne(doc);

      return {
        ...doc,
        _id: insertResult.insertedId,
        // TODO: _id is not present in internal workers
        worker: worker as any,
      };
    },

    patch: async ({ taskId, _id }, newNode) => 
    {
      if ('inputs' in newNode)
      {
        // find the worker through either newNode or the database if not specified in PATCH
        const { workerId } = 
          'workerId' in newNode ?
            newNode :
            await nodes.findOne({ _id, taskId })
        ; 

        const worker = await findWorkerForNode(
          { workerId },
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
