import { Static } from '@unologin/typebox-extended/typebox';
import type { TObject } from '@sinclair/typebox';
export declare const task: TObject<{
    _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    owners: import("@sinclair/typebox").TArray<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
}>;
export declare const dataTypeDefinition: import("@sinclair/typebox").TAny;
export declare type DataTypeDefinition = Static<typeof dataTypeDefinition>;
export declare const dataTypeRecord: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
export declare type DataTypeRecord = Static<typeof dataTypeRecord>;
export declare const worker: TObject<{
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    inputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    outputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
}>;
export declare const workerWrite: TObject<Omit<{
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    inputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    outputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
}, "createdAt">>;
export declare const internalWorker: TObject<Omit<{
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    inputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    outputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
}, "createdAt">>;
export declare type Worker = Static<typeof worker>;
export declare type WorkerWrite = Static<typeof workerWrite>;
export declare type InternalWorker = Static<typeof internalWorker>;
export declare const taskWrite: TObject<Omit<{
    _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    owners: import("@sinclair/typebox").TArray<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
}, "_id" | "createdAt">>;
export declare type Task = Static<typeof task>;
export declare type TaskWrite = Static<typeof taskWrite>;
export declare const node: TObject<{
    _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    taskId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    inputs: import("@sinclair/typebox").TArray<TObject<{
        nodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        outputChannel: import("@sinclair/typebox").TString;
        inputChannel: import("@sinclair/typebox").TString;
    }>>;
    numExecutions: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    params: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
    workerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    position: TObject<{
        x: import("@sinclair/typebox").TNumber;
        y: import("@sinclair/typebox").TNumber;
    }>;
}>;
export declare const nodeWrite: TObject<Omit<Omit<{
    _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    taskId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    inputs: import("@sinclair/typebox").TArray<TObject<{
        nodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        outputChannel: import("@sinclair/typebox").TString;
        inputChannel: import("@sinclair/typebox").TString;
    }>>;
    numExecutions: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    params: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
    workerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    position: TObject<{
        x: import("@sinclair/typebox").TNumber;
        y: import("@sinclair/typebox").TNumber;
    }>;
}, "_id" | "createdAt">, "taskId">>;
export declare const nodeRead: TObject<{
    worker: import("@sinclair/typebox").TUnion<[TObject<{
        _id: import("@sinclair/typebox").TString;
        createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
        title: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        inputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
        outputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
        params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    }>, TObject<Omit<{
        _id: import("@sinclair/typebox").TString;
        createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
        title: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        inputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
        outputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
        params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    }, "createdAt">>]>;
    _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    taskId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    inputs: import("@sinclair/typebox").TArray<TObject<{
        nodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        outputChannel: import("@sinclair/typebox").TString;
        inputChannel: import("@sinclair/typebox").TString;
    }>>;
    numExecutions: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    params: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
    workerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    position: TObject<{
        x: import("@sinclair/typebox").TNumber;
        y: import("@sinclair/typebox").TNumber;
    }>;
}>;
export declare const nodeQuery: TObject<{
    _id: import("@sinclair/typebox").TOptional<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    taskId: import("@sinclair/typebox").TOptional<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
}>;
export declare type NodeQuery = Static<typeof nodeQuery>;
export declare type Node = Static<typeof node>;
export declare type NodeWrite = Static<typeof nodeWrite>;
export declare type NodeRead = Static<typeof nodeRead>;
export declare const flowIdSchema: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>;
export declare type FlowId = Static<typeof flowIdSchema>;
export declare const flowStackSchema: import("@sinclair/typebox").TArray<TObject<{
    flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>;
    splitNodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    numEmitted: import("@sinclair/typebox").TInteger;
}>>;
export declare type FlowStack = Static<typeof flowStackSchema>;
export declare const dataItem: TObject<{
    flowId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>>;
    flowStack: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<TObject<{
        flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>;
        splitNodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        numEmitted: import("@sinclair/typebox").TInteger;
    }>>>;
    consumptionId: import("@sinclair/typebox").TUnion<[import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>, import("@sinclair/typebox").TNull]>;
    _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    taskId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    nodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    outputChannel: import("@sinclair/typebox").TString;
    producerNodeIds: import("@sinclair/typebox").TArray<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    done: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    autoDoneAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TAny>;
}>;
export declare const dataItemWrite: TObject<Omit<{
    flowId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>>;
    flowStack: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<TObject<{
        flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>;
        splitNodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        numEmitted: import("@sinclair/typebox").TInteger;
    }>>>;
    consumptionId: import("@sinclair/typebox").TUnion<[import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>, import("@sinclair/typebox").TNull]>;
    _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    taskId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    nodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    outputChannel: import("@sinclair/typebox").TString;
    producerNodeIds: import("@sinclair/typebox").TArray<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    done: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    autoDoneAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TAny>;
}, "_id" | "createdAt" | "taskId" | "nodeId" | "producerNodeIds" | "flowStack">>;
declare type DataItemGeneric<T, C> = {
    data: T[];
    outputChannel: C;
};
export declare type DataItem<T = any, C = string> = Omit<Static<typeof dataItem>, keyof DataItemGeneric<T, C>> & DataItemGeneric<T, C>;
export declare type DataItemWrite<T = any, C = string> = Omit<Static<typeof dataItemWrite>, keyof DataItemGeneric<T, C>> & DataItemGeneric<T, C>;
export declare type WorkerDataType<IO extends 'inputs' | 'outputs', W extends Pick<Worker, IO>, C extends keyof W[IO]> = Static<W[IO][C]>;
export declare type DataInput<W extends WorkerWrite, C extends keyof W['inputs']> = WorkerDataType<'inputs', W, C>;
export declare type DataOutput<W extends WorkerWrite, C extends keyof W['outputs']> = WorkerDataType<'outputs', W, C>;
export declare const dataItemQuery: TObject<{
    _id: import("@sinclair/typebox").TOptional<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    taskId: import("@sinclair/typebox").TOptional<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    nodeId: import("@sinclair/typebox").TOptional<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    done: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    flowId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>>;
    sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<1>, import("@sinclair/typebox").TLiteral<-1>]>>>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    offset: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
}>;
export declare type DataItemQuery = Static<typeof dataItemQuery>;
export declare const bundleConsumption: TObject<{
    _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    expiresAt: import("@sinclair/typebox").TUnion<[import("@unologin/typebox-extended").TUserDefined<Date>, import("@sinclair/typebox").TNull]>;
    done: import("@sinclair/typebox").TBoolean;
}>;
export declare type BundleConsumption = Static<typeof bundleConsumption>;
export declare const bundle: TObject<{
    _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    inputItems: import("@sinclair/typebox").TArray<TObject<{
        itemId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        position: import("@sinclair/typebox").TInteger;
        nodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        outputChannel: import("@sinclair/typebox").TString;
        inputChannel: import("@sinclair/typebox").TString;
    }>>;
    depth: import("@sinclair/typebox").TInteger;
    taskId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>;
    lowerFlowIds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>>>;
    flowStack: import("@sinclair/typebox").TArray<TObject<{
        flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>;
        splitNodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        numEmitted: import("@sinclair/typebox").TInteger;
    }>>;
    done: import("@sinclair/typebox").TBoolean;
    consumerId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    workerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    numAvailable: import("@sinclair/typebox").TInteger;
    numTaken: import("@sinclair/typebox").TInteger;
    allTaken: import("@sinclair/typebox").TBoolean;
    consumptions: import("@sinclair/typebox").TArray<TObject<{
        _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        expiresAt: import("@sinclair/typebox").TUnion<[import("@unologin/typebox-extended").TUserDefined<Date>, import("@sinclair/typebox").TNull]>;
        done: import("@sinclair/typebox").TBoolean;
    }>>;
}>;
export declare const bundleRead: TObject<{
    items: import("@sinclair/typebox").TArray<TObject<{
        flowId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>>;
        flowStack: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<TObject<{
            flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>;
            splitNodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
            numEmitted: import("@sinclair/typebox").TInteger;
        }>>>;
        consumptionId: import("@sinclair/typebox").TUnion<[import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>, import("@sinclair/typebox").TNull]>;
        _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
        taskId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        nodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        outputChannel: import("@sinclair/typebox").TString;
        producerNodeIds: import("@sinclair/typebox").TArray<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
        done: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        autoDoneAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TAny>;
    }>>;
    consumptionId: import("@sinclair/typebox").TOptional<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    createdAt: import("@unologin/typebox-extended").TUserDefined<Date>;
    inputItems: import("@sinclair/typebox").TArray<TObject<{
        itemId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        position: import("@sinclair/typebox").TInteger;
        nodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        outputChannel: import("@sinclair/typebox").TString;
        inputChannel: import("@sinclair/typebox").TString;
    }>>;
    depth: import("@sinclair/typebox").TInteger;
    taskId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>;
    lowerFlowIds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>>>;
    flowStack: import("@sinclair/typebox").TArray<TObject<{
        flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>]>;
        splitNodeId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        numEmitted: import("@sinclair/typebox").TInteger;
    }>>;
    done: import("@sinclair/typebox").TBoolean;
    consumerId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
    workerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    numAvailable: import("@sinclair/typebox").TInteger;
    numTaken: import("@sinclair/typebox").TInteger;
    allTaken: import("@sinclair/typebox").TBoolean;
    consumptions: import("@sinclair/typebox").TArray<TObject<{
        _id: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
        expiresAt: import("@sinclair/typebox").TUnion<[import("@unologin/typebox-extended").TUserDefined<Date>, import("@sinclair/typebox").TNull]>;
        done: import("@sinclair/typebox").TBoolean;
    }>>;
}>;
export declare const bundleQuery: TObject<{
    _id: import("@sinclair/typebox").TOptional<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    taskId: import("@sinclair/typebox").TOptional<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    consumerId: import("@sinclair/typebox").TOptional<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    workerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    done: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    flowId: import("@sinclair/typebox").TOptional<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    after: import("@sinclair/typebox").TOptional<import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    consume: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    unconsumeAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
}>;
export declare const bundleWrite: TObject<{
    consumptionId: import("@unologin/typebox-extended").TUserDefined<import("bson").ObjectID>;
}>;
export declare type BundleQuery = Static<typeof bundleQuery>;
export declare type Bundle = Static<typeof bundle>;
export declare type BundleRead = Static<typeof bundleRead>;
export {};
