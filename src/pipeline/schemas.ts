
import { Static, Type } from '@unologin/typebox-extended/typebox';

import { date, objectId } from '@unologin/server-common/lib/schemas/general';

import type { TObject, TProperties } from '@sinclair/typebox';

const writeType = <T extends TProperties>(schema : TObject<T>) => 
  Type.Omit(schema, ['_id', 'createdAt'])
;

export const task = Type.Object(
  {
    _id: objectId,

    createdAt: date,

    // human readable title and description
    title: Type.String(),
    description: Type.Optional(Type.String()),

    // task-wide parameters for all nodes
    params: Type.Record(Type.String(), Type.Any()),

    // list of owners
    owners: Type.Array(objectId),
  },
);

// TODO: this should be JSON schema meta schema
export const dataTypeDefinition = Type.Any();

export type DataTypeDefinition = Static<typeof dataTypeDefinition>;

export const dataTypeRecord = Type.Record(
  Type.String(),
  dataTypeDefinition,
);

export type DataTypeRecord = Static<typeof dataTypeRecord>;

// defines outline or blueprint for a node
export const worker = Type.Object(
  {
    // set by the worker itself
    _id: Type.String(),

    createdAt: date,

    // human readable title and description
    title: Type.String(),
    description: Type.Optional(Type.String()),

    inputs: dataTypeRecord,

    outputs: dataTypeRecord,

    params: dataTypeRecord,
  },
);

export const workerWrite = Type.Omit(
  worker, ['createdAt'],
);

export const internalWorker = workerWrite;

export type Worker = Static<typeof worker>;
export type WorkerWrite = Static<typeof workerWrite>;
export type InternalWorker = Static<typeof internalWorker>;

export const taskWrite = writeType(task);

export type Task = Static<typeof task>;
export type TaskWrite = Static<typeof taskWrite>;

const nodeProps = 
{
  _id: objectId,

  createdAt: date,

  taskId: objectId,

  // references other nodes from the same task
  inputs: Type.Array(
    Type.Object(
      {
        nodeId: objectId,
        // name of the output channel
        outputChannel: Type.String(),
        // name of the input channel
        inputChannel: Type.String(),
      },
    ),
  ),

  // how many times to process a single input bundle
  numExecutions: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),

  params: Type.Optional(Type.Record(
    Type.String(),
    Type.Any(),
  )),

  // responsible worker
  workerId: Type.Optional(Type.String()),

  // position in the pipeline UI
  position: Type.Object(
    {
      x: Type.Number(),
      y: Type.Number(),
    },
  ),
};  

export const node = Type.Object(nodeProps);

export const nodeWrite = Type.Omit(
  writeType<typeof nodeProps>(node), 
  ['taskId'],
);

export const nodeRead = Type.Object(
  {
    ...nodeProps,
    worker: Type.Union([worker, internalWorker]),
  },
);

export const nodeQuery = Type.Object(
  {
    _id: Type.Optional(objectId),
    taskId: Type.Optional(objectId),
  },
);

export type NodeQuery = Static<typeof nodeQuery>;
export type Node = Static<typeof node>;
export type NodeWrite = Static<typeof nodeWrite>;
export type NodeRead = Static<typeof nodeRead>;

export const flowIdSchema = Type.Union(
  [Type.String(), objectId],
);

export type FlowId = Static<typeof flowIdSchema>;

export const flowStackSchema = Type.Array(
  Type.Object(
    {
      flowId: flowIdSchema,
      splitNodeId: objectId,
      numEmitted: Type.Integer(),
    },
  ),
);

export type FlowStack = Static<typeof flowStackSchema>;

const dataItemProps = 
{
  _id: objectId,

  createdAt: date,

  // _id of the task this item belongs to
  taskId: objectId,

  // _id of node which produced this data item
  nodeId: objectId,

  // name of the output this data item belongs to
  outputChannel: Type.String(),

  // items with the same flowId can only exist once between two nodes
  // items with the same flowId from different nodes to the same consumer are grouped as bundles
  flowId: flowIdSchema,

  // stack of all flowIds (except item.flowId) this item belongs to (pushed in split-, popped in join node)
  flowStack: flowStackSchema,

  // list of all nodes this item (or its parents from splits) has passed through
  producerNodeIds: Type.Array(objectId),

  // set to true once all processing has completed
  done: Type.Optional(Type.Boolean({ default: false })),

  // will automatically set done:true once data.length reaches this value
  autoDoneAfter: Type.Optional(Type.Integer()),

  // output data
  data: Type.Array(Type.Any()),
};

export const dataItem = Type.Object(
  {
    ...dataItemProps,
    flowId: Type.Optional(dataItemProps.flowId),
    flowStack: Type.Optional(dataItemProps.flowStack),
  },
);

export const dataItemWrite = Type.Omit(
  dataItem,
  ['taskId', 'nodeId', 'producerNodeIds', 'createdAt', '_id'],
);

// generic part of the DataItem type
type DataItemGeneric<T, C> = 
{
  data: T[];
  outputChannel: C;
};

export type DataItem<T=any, C = string> = 
  Omit<Static<typeof dataItem>, keyof DataItemGeneric<T, C>> &
  DataItemGeneric<T, C>
;

export type DataItemWrite<T=any, C = string> = 
  Omit<Static<typeof dataItemWrite>, keyof DataItemGeneric<T, C>> & 
  DataItemGeneric<T, C>
;

export type WorkerDataType<
  IO extends 'inputs' | 'outputs',
  W extends Pick<Worker, IO>,
  C extends keyof W[IO]
> = Static<W[IO][C]>;

export type DataInput<W extends WorkerWrite, C extends keyof W['inputs']> =
  WorkerDataType<'inputs', W, C>
;

export type DataOutput<
  W extends WorkerWrite, 
  C extends keyof W['outputs']
> = WorkerDataType<'outputs', W, C>;


export const dataItemQuery = Type.Object(
  {
    _id: Type.Optional(objectId),
    taskId: Type.Optional(objectId),
    nodeId: Type.Optional(objectId),
    done: Type.Optional(Type.Boolean()),
    flowId: Type.Optional(flowIdSchema),
    // the consumptionId of  the input that produced this item as an output
    consumptionId: Type.Optional(objectId),
    sort: Type.Optional(
      Type.Record(
        Type.String(), 
        Type.Union([Type.Literal(1), Type.Literal(-1)]),
        { default: { _id: -1 } },
      ),
    ),
    limit: Type.Optional(Type.Integer({ minimum: 1 })),
    offset: Type.Optional(Type.Integer({ minimum: 0 })),
  },
);

export type DataItemQuery = Static<typeof dataItemQuery>;

export const bundleConsumption = Type.Object(
  {
    _id: objectId,
    expiresAt: Type.Union([date, Type.Null()]),
    done: Type.Boolean(),
  },
);

export type BundleConsumption = Static<typeof bundleConsumption>;

const bundleProps = 
{
  _id: objectId,

  createdAt: date,

  // items in this bundle in order of consumer.inputs
  inputItems: Type.Array(
    Type.Object(
      {
        itemId: objectId,
        position: Type.Integer(),
        nodeId: objectId,
        outputChannel: Type.String(),
        inputChannel: Type.String(),
      },
    ),
  ),

  // how many times a bundle with this flowId has been passed through this node already
  depth: Type.Integer({ minimum: 0 }),

  taskId: objectId,

  // same as dataItem.flowId highest flowId of all items
  flowId: flowIdSchema,

  // all flowIds from the flowStack of all items in this bundle
  lowerFlowIds: Type.Optional(Type.Array(flowIdSchema)),

  // flow stack of deepest item
  flowStack: flowStackSchema,

  // true iff all required data items are done
  done: Type.Boolean(),

  // node that may consume these items
  consumerId: objectId,

  // worker responsible (redundant as this is stored in node too but improves queries)
  workerId: Type.Optional(Type.String()),

  // how many times this bundle may be consumed
  numAvailable: Type.Integer({ minimum: 1 }),

  // how many times this bundle has been consumed (won't be available once this reaches node.numExecutions)
  numTaken: Type.Integer({ minimum: 0 }),

  // same as (numTaken === numAvailable)
  allTaken: Type.Boolean(),

  consumptions: Type.Array(bundleConsumption),
};

export const bundle = Type.Object(bundleProps);

export const bundleRead = Type.Object(
  {
    ...bundleProps,

    items: Type.Array(dataItem),
  },
);


export const bundleQuery = Type.Object(
  {
    _id: Type.Optional(objectId),
    taskId: Type.Optional(objectId),
    consumerId: Type.Optional(objectId),
    workerId: Type.Optional(Type.String()),
    done: Type.Optional(Type.Boolean()),
    flowId: Type.Optional(objectId),
    limit: Type.Optional(Type.Integer({ minimum: 1 })),

    // set to true if returned bundles should be consumed
    consume: Type.Optional(Type.Boolean()),

    // set if the bundle should be automatically unconsumed after n seconds
    unconsumeAfter: Type.Optional(Type.Integer({ minimum: 1 })),
  },
);

// used when unconsuming bunldes
export const bundleWrite = Type.Object(
  {
    consumptionId: objectId,
  },
);

export type BundleQuery = Static<typeof bundleQuery>;

export type Bundle = Static<typeof bundle>;
export type BundleRead = Static<typeof bundleRead>;
