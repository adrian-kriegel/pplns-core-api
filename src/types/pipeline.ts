
import { Static, Type } from '@unologin/typebox-extended/typebox';

import { objectId } from '@unologin/server-common/lib/schemas/general';

export const task = Type.Object(
  {
    _id: objectId,

    // human readable title and description
    title: Type.String(),
    description: Type.Optional(Type.String()),

    // task-wide parameters for all nodes
    params: Type.Record(Type.String(), Type.Any()),

    // list of owners
    owners: Type.Array(objectId),
  },
);

export type Task = Static<typeof task>;

export const node = Type.Object(
  {
    _id: objectId,

    taskId: objectId,

    // references other nodes from the same task
    inputs: Type.Array(objectId),

    // name/id of the worker responsible
    worker: Type.String(),
  },
);

export const nodeWrite = Type.Omit(node, ['taskId', '_id']);

export type Node = Static<typeof node>;
export type NodeWrite = Static<typeof nodeWrite>;

export const dataItem = Type.Object(
  {
    _id: objectId,

    // _id of the task this item belongs to
    taskId: objectId,

    // _id of node which produced this data item
    nodeId: objectId,

    // grouping identifier for outputs that belong together (not _id of bundle!)
    bundle: Type.String(),

    // set to true once all processing has completed
    done: Type.Boolean(),

    // output data
    data: Type.Any(),
  },
);

export const dataItemWrite = Type.Omit(dataItem, ['taskId', 'nodeId']);

export type DataItem = Static<typeof dataItem>;
export type DataItemWrite = Static<typeof dataItemWrite>;

const bundleProps = 
{
  _id: objectId,

  // items in this bundle in order of consumer.inputs
  itemIds: Type.Array(objectId),

  taskId: objectId,

  bundle: Type.String(),

  // true iff all required data items are done
  done: Type.Boolean(),

  // node that may consume these items
  consumerId: objectId,
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
