
import { Static, Type } from '@unologin/typebox-extended/typebox';

import { date, objectId } from '@unologin/server-common/lib/schemas/general';
import { TObject, TProperties } from '@sinclair/typebox';

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

export const taskWrite = writeType(task);

export type Task = Static<typeof task>;
export type TaskWrite = Static<typeof taskWrite>;

export const node = Type.Object(
  {
    _id: objectId,

    createdAt: date,

    taskId: objectId,

    // references other nodes from the same task
    inputs: Type.Array(
      Type.Object(
        {
          nodeId: objectId,
          output: Type.String(),
        },
      ),
    ),

    // responsible worker
    workerId: objectId,
  },
);

export const nodeWrite = Type.Omit(writeType(node), ['taskId']);

export type Node = Static<typeof node>;
export type NodeWrite = Static<typeof nodeWrite>;

export const dataItem = Type.Object(
  {
    _id: objectId,

    createdAt: date,

    // _id of the task this item belongs to
    taskId: objectId,

    // _id of node which produced this data item
    nodeId: objectId,

    // name of the output this data item belongs to
    output: Type.String(),

    // grouping identifier for outputs that belong together e.g. _id of input (not _id of bundle!)
    bundle: Type.String(),

    // set to true once all processing has completed
    done: Type.Boolean(),

    // output data
    data: Type.Array(Type.Any()),
  },
);

export const dataItemWrite = Type.Omit(
  writeType(dataItem),
  ['taskId', 'nodeId'],
);

export type DataItem = Static<typeof dataItem>;
export type DataItemWrite = Static<typeof dataItemWrite>;

const bundleProps = 
{
  _id: objectId,

  createdAt: date,

  // items in this bundle in order of consumer.inputs
  itemIds: Type.Array(objectId),

  taskId: objectId,

  // same as dataItem.bundle
  bundle: Type.String(),

  // true iff all required data items are done
  done: Type.Boolean(),

  // node that may consume these items
  consumerId: objectId,

  // time the bundle is taken at (won't be available to consumers afterwards)
  consumedAt: Type.Optional(date),
};

export const bundle = Type.Object(bundleProps);

export const bundleRead = Type.Object(
  {
    ...bundleProps,
    items: Type.Array(dataItem),
  },
);

export type Bundle = Static<typeof bundle>;
export type BundleRead = Static<typeof bundleRead>;

export const dataTypeDefinition = Type.Object(
  {
    description: Type.String(),

    // TODO: jsonschema meta schema
    schema: Type.Optional(Type.Any()),
  },
);

// defines outline or blueprint for a node
export const worker = Type.Object(
  {
    _id: objectId,

    createdAt: date,

    // human readable title and description
    title: Type.String(),
    description: Type.Optional(Type.String()),

    inputs: Type.Record(
      Type.String(),
      dataTypeDefinition,
    ),

    outputs: Type.Record(
      Type.String(),
      dataTypeDefinition,
    ),

    params: Type.Record(
      Type.String(),
      dataTypeDefinition,
    ),
  },
);

export const workerWrite = writeType(worker);

export type Worker = Static<typeof worker>;
export type WorkerWrite = Static<typeof workerWrite>;
