"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.bundleWrite = exports.bundleQuery = exports.bundleRead = exports.bundle = exports.bundleConsumption = exports.dataItemQuery = exports.dataItemWrite = exports.dataItem = exports.flowStackSchema = exports.flowIdSchema = exports.nodeQuery = exports.nodeRead = exports.nodeWrite = exports.node = exports.taskWrite = exports.internalWorker = exports.workerWrite = exports.worker = exports.dataTypeRecord = exports.dataTypeDefinition = exports.task = void 0;
var typebox_1 = require("@unologin/typebox-extended/typebox");
var general_1 = require("@unologin/server-common/lib/schemas/general");
var writeType = function (schema) {
    return typebox_1.Type.Omit(schema, ['_id', 'createdAt']);
};
exports.task = typebox_1.Type.Object({
    _id: general_1.objectId,
    createdAt: general_1.date,
    // human readable title and description
    title: typebox_1.Type.String(),
    description: typebox_1.Type.Optional(typebox_1.Type.String()),
    // task-wide parameters for all nodes
    params: typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.Any()),
    // list of owners
    owners: typebox_1.Type.Array(general_1.objectId)
});
// TODO: this should be JSON schema meta schema
exports.dataTypeDefinition = typebox_1.Type.Any();
exports.dataTypeRecord = typebox_1.Type.Record(typebox_1.Type.String(), exports.dataTypeDefinition);
// defines outline or blueprint for a node
exports.worker = typebox_1.Type.Object({
    // set by the worker itself
    _id: typebox_1.Type.String(),
    createdAt: general_1.date,
    // human readable title and description
    title: typebox_1.Type.String(),
    description: typebox_1.Type.Optional(typebox_1.Type.String()),
    inputs: exports.dataTypeRecord,
    outputs: exports.dataTypeRecord,
    params: exports.dataTypeRecord
});
exports.workerWrite = typebox_1.Type.Omit(exports.worker, ['createdAt']);
exports.internalWorker = exports.workerWrite;
exports.taskWrite = writeType(exports.task);
var nodeProps = {
    _id: general_1.objectId,
    createdAt: general_1.date,
    taskId: general_1.objectId,
    // references other nodes from the same task
    inputs: typebox_1.Type.Array(typebox_1.Type.Object({
        nodeId: general_1.objectId,
        // name of the output channel
        outputChannel: typebox_1.Type.String(),
        // name of the input channel
        inputChannel: typebox_1.Type.String()
    })),
    // how many times to process a single input bundle
    numExecutions: typebox_1.Type.Optional(typebox_1.Type.Integer({ minimum: 1, "default": 1 })),
    params: typebox_1.Type.Optional(typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.Any())),
    // responsible worker
    workerId: typebox_1.Type.Optional(typebox_1.Type.String()),
    // position in the pipeline UI
    position: typebox_1.Type.Object({
        x: typebox_1.Type.Number(),
        y: typebox_1.Type.Number()
    })
};
exports.node = typebox_1.Type.Object(nodeProps);
exports.nodeWrite = typebox_1.Type.Omit(writeType(exports.node), ['taskId']);
exports.nodeRead = typebox_1.Type.Object(__assign(__assign({}, nodeProps), { worker: typebox_1.Type.Union([exports.worker, exports.internalWorker]) }));
exports.nodeQuery = typebox_1.Type.Object({
    _id: typebox_1.Type.Optional(general_1.objectId),
    taskId: typebox_1.Type.Optional(general_1.objectId)
});
exports.flowIdSchema = typebox_1.Type.Union([typebox_1.Type.String(), general_1.objectId]);
exports.flowStackSchema = typebox_1.Type.Array(typebox_1.Type.Object({
    flowId: exports.flowIdSchema,
    splitNodeId: general_1.objectId,
    numEmitted: typebox_1.Type.Integer()
}));
var dataItemProps = {
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
    flowStack: exports.flowStackSchema,
    // list of all nodes this item (or its parents from splits) has passed through
    producerNodeIds: typebox_1.Type.Array(general_1.objectId),
    // set to true once all processing has completed
    done: typebox_1.Type.Optional(typebox_1.Type.Boolean({ "default": false })),
    // will automatically set done:true once data.length reaches this value
    autoDoneAfter: typebox_1.Type.Optional(typebox_1.Type.Integer()),
    // output data
    data: typebox_1.Type.Array(typebox_1.Type.Any())
};
exports.dataItem = typebox_1.Type.Object(__assign(__assign({}, dataItemProps), { flowId: typebox_1.Type.Optional(dataItemProps.flowId), flowStack: typebox_1.Type.Optional(dataItemProps.flowStack), 
    // the consumptionId of the input that produced this item as an output
    consumptionId: typebox_1.Type.Union([general_1.objectId, typebox_1.Type.Null()]) }));
exports.dataItemWrite = typebox_1.Type.Omit(exports.dataItem, ['taskId', 'nodeId', 'producerNodeIds', 'createdAt', '_id', 'flowStack']);
exports.dataItemQuery = typebox_1.Type.Object({
    _id: typebox_1.Type.Optional(general_1.objectId),
    taskId: typebox_1.Type.Optional(general_1.objectId),
    nodeId: typebox_1.Type.Optional(general_1.objectId),
    done: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
    flowId: typebox_1.Type.Optional(exports.flowIdSchema),
    sort: typebox_1.Type.Optional(typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.Union([typebox_1.Type.Literal(1), typebox_1.Type.Literal(-1)]), { "default": { _id: -1 } })),
    limit: typebox_1.Type.Optional(typebox_1.Type.Integer({ minimum: 1 })),
    offset: typebox_1.Type.Optional(typebox_1.Type.Integer({ minimum: 0 }))
});
exports.bundleConsumption = typebox_1.Type.Object({
    _id: general_1.objectId,
    expiresAt: typebox_1.Type.Union([general_1.date, typebox_1.Type.Null()]),
    done: typebox_1.Type.Boolean()
});
var bundleProps = {
    _id: general_1.objectId,
    createdAt: general_1.date,
    // items in this bundle in order of consumer.inputs
    inputItems: typebox_1.Type.Array(typebox_1.Type.Object({
        itemId: general_1.objectId,
        position: typebox_1.Type.Integer(),
        nodeId: general_1.objectId,
        outputChannel: typebox_1.Type.String(),
        inputChannel: typebox_1.Type.String()
    })),
    // how many times a bundle with this flowId has been passed through this node already
    depth: typebox_1.Type.Integer({ minimum: 0 }),
    taskId: general_1.objectId,
    // same as dataItem.flowId highest flowId of all items
    flowId: exports.flowIdSchema,
    // all flowIds from the flowStack of all items in this bundle
    lowerFlowIds: typebox_1.Type.Optional(typebox_1.Type.Array(exports.flowIdSchema)),
    // flow stack of deepest item
    flowStack: exports.flowStackSchema,
    // true iff all required data items are done
    done: typebox_1.Type.Boolean(),
    // node that may consume these items
    consumerId: general_1.objectId,
    // worker responsible (redundant as this is stored in node too but improves queries)
    workerId: typebox_1.Type.Optional(typebox_1.Type.String()),
    // how many times this bundle may be consumed
    numAvailable: typebox_1.Type.Integer({ minimum: 1 }),
    // how many times this bundle has been consumed (won't be available once this reaches node.numExecutions)
    numTaken: typebox_1.Type.Integer({ minimum: 0 }),
    // same as (numTaken === numAvailable)
    allTaken: typebox_1.Type.Boolean(),
    consumptions: typebox_1.Type.Array(exports.bundleConsumption)
};
exports.bundle = typebox_1.Type.Object(bundleProps);
exports.bundleRead = typebox_1.Type.Object(__assign(__assign({}, bundleProps), { items: typebox_1.Type.Array(exports.dataItem), consumptionId: typebox_1.Type.Optional(general_1.objectId) }));
exports.bundleQuery = typebox_1.Type.Object({
    _id: typebox_1.Type.Optional(general_1.objectId),
    taskId: typebox_1.Type.Optional(general_1.objectId),
    consumerId: typebox_1.Type.Optional(general_1.objectId),
    workerId: typebox_1.Type.Optional(typebox_1.Type.String()),
    done: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
    flowId: typebox_1.Type.Optional(general_1.objectId),
    // set to a bundleId in order to get only bundles inserted after
    // the specified bundle
    after: typebox_1.Type.Optional(general_1.objectId),
    limit: typebox_1.Type.Optional(typebox_1.Type.Integer({ minimum: 1 })),
    // set to true if returned bundles should be consumed
    consume: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
    // set if the bundle should be automatically unconsumed after n seconds
    unconsumeAfter: typebox_1.Type.Optional(typebox_1.Type.Integer({ minimum: 1 }))
});
// used when unconsuming bundles
exports.bundleWrite = typebox_1.Type.Object({
    consumptionId: general_1.objectId
});
