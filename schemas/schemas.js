"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleQuery = exports.bundleRead = exports.bundle = exports.dataItemQuery = exports.dataItemWrite = exports.dataItem = exports.flowIdSchema = exports.nodeRead = exports.nodeWrite = exports.node = exports.taskWrite = exports.workerWrite = exports.worker = exports.dataTypeRecord = exports.dataTypeDefinition = exports.task = void 0;
const typebox_1 = require("@unologin/typebox-extended/typebox");
const general_1 = require("@unologin/server-common/lib/schemas/general");
const writeType = (schema) => typebox_1.Type.Omit(schema, ['_id', 'createdAt']);
exports.task = typebox_1.Type.Object({
    _id: general_1.objectId,
    createdAt: general_1.date,
    // human readable title and description
    title: typebox_1.Type.String(),
    description: typebox_1.Type.Optional(typebox_1.Type.String()),
    // task-wide parameters for all nodes
    params: typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.Any()),
    // list of owners
    owners: typebox_1.Type.Array(general_1.objectId),
});
// TODO: this should be JSON schema meta schema
exports.dataTypeDefinition = typebox_1.Type.Any();
exports.dataTypeRecord = typebox_1.Type.Record(typebox_1.Type.String(), exports.dataTypeDefinition);
// defines outline or blueprint for a node
exports.worker = typebox_1.Type.Object({
    _id: general_1.objectId,
    createdAt: general_1.date,
    // unique key for each worker
    key: typebox_1.Type.String(),
    // human readable title and description
    title: typebox_1.Type.String(),
    description: typebox_1.Type.Optional(typebox_1.Type.String()),
    inputs: exports.dataTypeRecord,
    outputs: exports.dataTypeRecord,
    params: exports.dataTypeRecord,
});
// internal workers are not stored in the database and therefore do not have _id and createdAt
const internalWorker = typebox_1.Type.Omit(exports.worker, ['_id', 'createdAt']);
exports.workerWrite = writeType(exports.worker);
exports.taskWrite = writeType(exports.task);
const nodeProps = {
    _id: general_1.objectId,
    createdAt: general_1.date,
    taskId: general_1.objectId,
    // references other nodes from the same task
    inputs: typebox_1.Type.Array(typebox_1.Type.Object({
        nodeId: general_1.objectId,
        // name of the output channel
        outputChannel: typebox_1.Type.String(),
        // name of the input channel
        inputChannel: typebox_1.Type.String(),
    })),
    // how many times to process a single input bundle
    numExecutions: typebox_1.Type.Optional(typebox_1.Type.Integer({ minimum: 1, default: 1 })),
    params: typebox_1.Type.Optional(typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.Any())),
    // responsible worker
    workerId: typebox_1.Type.Optional(general_1.objectId),
    internalWorker: typebox_1.Type.Optional(typebox_1.Type.String()),
    // position in the pipeline UI
    position: typebox_1.Type.Object({
        x: typebox_1.Type.Number(),
        y: typebox_1.Type.Number(),
    }),
};
exports.node = typebox_1.Type.Object(nodeProps);
exports.nodeWrite = typebox_1.Type.Omit(writeType(exports.node), ['taskId']);
exports.nodeRead = typebox_1.Type.Object({
    ...nodeProps,
    worker: typebox_1.Type.Union([exports.worker, internalWorker]),
});
exports.flowIdSchema = typebox_1.Type.Union([typebox_1.Type.String(), general_1.objectId]);
const dataItemProps = {
    _id: general_1.objectId,
    createdAt: general_1.date,
    // _id of the task this item belongs to
    taskId: general_1.objectId,
    // _id of node which produced this data item
    nodeId: general_1.objectId,
    // name of the output this data item belongs to
    outputChannel: typebox_1.Type.String(),
    // items with the same flowId can only exist once between two nodes
    // items with the same flowId from different nodes to the same consumer are grouped as bundles
    flowId: exports.flowIdSchema,
    // stack of all flowIds (except item.flowId) this item belongs to (pushed in split-, popped in join node)
    flowStack: typebox_1.Type.Array(typebox_1.Type.Object({
        flowId: exports.flowIdSchema,
        splitNodeId: general_1.objectId,
        numEmitted: typebox_1.Type.Integer(),
    })),
    // list of all nodes this item (or its parents from splits) has passed through
    producerNodeIds: typebox_1.Type.Array(general_1.objectId),
    // set to true once all processing has completed
    done: typebox_1.Type.Boolean(),
    // will automatically set done:true once data.length reaches this value
    autoDoneAfter: typebox_1.Type.Optional(typebox_1.Type.Integer()),
    // output data
    data: typebox_1.Type.Array(typebox_1.Type.Any()),
};
exports.dataItem = typebox_1.Type.Object({
    ...dataItemProps,
    flowId: typebox_1.Type.Optional(dataItemProps.flowId),
    flowStack: typebox_1.Type.Optional(dataItemProps.flowStack),
});
exports.dataItemWrite = typebox_1.Type.Omit(writeType(exports.dataItem), ['taskId', 'nodeId', 'producerNodeIds']);
exports.dataItemQuery = typebox_1.Type.Object({
    _id: typebox_1.Type.Optional(general_1.objectId),
    taskId: typebox_1.Type.Optional(general_1.objectId),
    nodeId: typebox_1.Type.Optional(general_1.objectId),
    done: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
    flowId: typebox_1.Type.Optional(exports.flowIdSchema),
});
const bundleProps = {
    _id: general_1.objectId,
    createdAt: general_1.date,
    // items in this bundle in order of consumer.inputs
    inputItems: typebox_1.Type.Array(typebox_1.Type.Object({
        itemId: general_1.objectId,
        position: typebox_1.Type.Integer(),
        nodeId: general_1.objectId,
        outputChannel: typebox_1.Type.String(),
        inputChannel: typebox_1.Type.String(),
    })),
    // how many times a bundle with this flowId has been passed through this node already
    depth: typebox_1.Type.Integer({ minimum: 0 }),
    taskId: general_1.objectId,
    // same as dataItem.flowId highest flowId of all items
    flowId: exports.flowIdSchema,
    // all flowIds from the flowStack of all items in this bundle
    lowerFlowIds: typebox_1.Type.Optional(typebox_1.Type.Array(exports.flowIdSchema)),
    // true iff all required data items are done
    done: typebox_1.Type.Boolean(),
    // node that may consume these items
    consumerId: general_1.objectId,
    // worker responsible (redundant as this is stored in node too but improves queries)
    workerId: general_1.objectId,
    // how many times this bundle may be consumed
    numAvailable: typebox_1.Type.Integer({ minimum: 1 }),
    // how many times this bundle has been consumed (won't be available once this reaches node.numExecutions)
    numTaken: typebox_1.Type.Integer({ minimum: 0 }),
    // same as (numTaken === numAvailable)
    allTaken: typebox_1.Type.Boolean(),
};
exports.bundle = typebox_1.Type.Object(bundleProps);
exports.bundleRead = typebox_1.Type.Object({
    ...bundleProps,
    items: typebox_1.Type.Array(exports.dataItem),
});
exports.bundleQuery = typebox_1.Type.Object({
    _id: typebox_1.Type.Optional(general_1.objectId),
    taskId: typebox_1.Type.Optional(general_1.objectId),
    consumerId: typebox_1.Type.Optional(general_1.objectId),
    workerId: typebox_1.Type.Optional(general_1.objectId),
    done: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
    flowId: typebox_1.Type.Optional(general_1.objectId),
    limit: typebox_1.Type.Optional(typebox_1.Type.Integer({ minimum: 1 })),
    // set to true if returned bundles should be consumed
    consume: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
});
