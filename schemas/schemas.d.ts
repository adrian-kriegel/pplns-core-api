import { Static } from '@unologin/typebox-extended/typebox';
import type { TObject } from '@sinclair/typebox';
export declare const task: TObject<{
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    owners: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
}>;
export declare const dataTypeDefinition: import("@sinclair/typebox").TAny;
export declare type DataTypeDefinition = Static<typeof dataTypeDefinition>;
export declare const dataTypeRecord: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
export declare type DataTypeRecord = Static<typeof dataTypeRecord>;
export declare const worker: TObject<{
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    key: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    inputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    outputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
}>;
export declare const workerWrite: TObject<Omit<{
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    key: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    inputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    outputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
}, "_id" | "createdAt">>;
export declare type Worker = Static<typeof worker>;
export declare type WorkerWrite = Static<typeof workerWrite>;
export declare const taskWrite: TObject<Omit<{
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    owners: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
}, "_id" | "createdAt">>;
export declare type Task = Static<typeof task>;
export declare type TaskWrite = Static<typeof taskWrite>;
export declare const node: TObject<{
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    taskId: import("@sinclair/typebox").TString;
    inputs: import("@sinclair/typebox").TArray<TObject<{
        nodeId: import("@sinclair/typebox").TString;
        outputChannel: import("@sinclair/typebox").TString;
        inputChannel: import("@sinclair/typebox").TString;
    }>>;
    numExecutions: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    params: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
    workerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    internalWorker: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    position: TObject<{
        x: import("@sinclair/typebox").TNumber;
        y: import("@sinclair/typebox").TNumber;
    }>;
}>;
export declare const nodeWrite: TObject<Omit<Omit<{
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    taskId: import("@sinclair/typebox").TString;
    inputs: import("@sinclair/typebox").TArray<TObject<{
        nodeId: import("@sinclair/typebox").TString;
        outputChannel: import("@sinclair/typebox").TString;
        inputChannel: import("@sinclair/typebox").TString;
    }>>;
    numExecutions: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    params: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
    workerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    internalWorker: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    position: TObject<{
        x: import("@sinclair/typebox").TNumber;
        y: import("@sinclair/typebox").TNumber;
    }>;
}, "_id" | "createdAt">, "taskId">>;
export declare const nodeRead: TObject<{
    worker: import("@sinclair/typebox").TUnion<[TObject<{
        _id: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TString;
        key: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        inputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
        outputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
        params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    }>, TObject<Omit<{
        _id: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TString;
        key: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        inputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
        outputs: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
        params: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    }, "_id" | "createdAt">>]>;
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    taskId: import("@sinclair/typebox").TString;
    inputs: import("@sinclair/typebox").TArray<TObject<{
        nodeId: import("@sinclair/typebox").TString;
        outputChannel: import("@sinclair/typebox").TString;
        inputChannel: import("@sinclair/typebox").TString;
    }>>;
    numExecutions: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    params: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
    workerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    internalWorker: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    position: TObject<{
        x: import("@sinclair/typebox").TNumber;
        y: import("@sinclair/typebox").TNumber;
    }>;
}>;
export declare type Node = Static<typeof node>;
export declare type NodeWrite = Static<typeof nodeWrite>;
export declare type NodeRead = Static<typeof nodeRead>;
export declare const flowIdSchema: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>;
export declare type FlowId = Static<typeof flowIdSchema>;
export declare const dataItem: TObject<{
    flowId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>>;
    flowStack: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<TObject<{
        flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>;
        splitNodeId: import("@sinclair/typebox").TString;
        numEmitted: import("@sinclair/typebox").TInteger;
    }>>>;
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    taskId: import("@sinclair/typebox").TString;
    nodeId: import("@sinclair/typebox").TString;
    outputChannel: import("@sinclair/typebox").TString;
    producerNodeIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    done: import("@sinclair/typebox").TBoolean;
    autoDoneAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TAny>;
}>;
export declare const dataItemWrite: TObject<Omit<{
    flowId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>>;
    flowStack: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<TObject<{
        flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>;
        splitNodeId: import("@sinclair/typebox").TString;
        numEmitted: import("@sinclair/typebox").TInteger;
    }>>>;
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    taskId: import("@sinclair/typebox").TString;
    nodeId: import("@sinclair/typebox").TString;
    outputChannel: import("@sinclair/typebox").TString;
    producerNodeIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    done: import("@sinclair/typebox").TBoolean;
    autoDoneAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TAny>;
}, "_id" | "createdAt" | "taskId" | "nodeId" | "producerNodeIds">>;
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
    _id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    taskId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    nodeId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    done: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    flowId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>>;
}>;
export declare type DataItemQuery = Static<typeof dataItemQuery>;
export declare const bundle: TObject<{
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    inputItems: import("@sinclair/typebox").TArray<TObject<{
        itemId: import("@sinclair/typebox").TString;
        position: import("@sinclair/typebox").TInteger;
        nodeId: import("@sinclair/typebox").TString;
        outputChannel: import("@sinclair/typebox").TString;
        inputChannel: import("@sinclair/typebox").TString;
    }>>;
    depth: import("@sinclair/typebox").TInteger;
    taskId: import("@sinclair/typebox").TString;
    flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>;
    lowerFlowIds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>>>;
    done: import("@sinclair/typebox").TBoolean;
    consumerId: import("@sinclair/typebox").TString;
    workerId: import("@sinclair/typebox").TString;
    numAvailable: import("@sinclair/typebox").TInteger;
    numTaken: import("@sinclair/typebox").TInteger;
    allTaken: import("@sinclair/typebox").TBoolean;
}>;
export declare const bundleRead: TObject<{
    items: import("@sinclair/typebox").TArray<TObject<{
        flowId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>>;
        flowStack: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<TObject<{
            flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>;
            splitNodeId: import("@sinclair/typebox").TString;
            numEmitted: import("@sinclair/typebox").TInteger;
        }>>>;
        _id: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TString;
        taskId: import("@sinclair/typebox").TString;
        nodeId: import("@sinclair/typebox").TString;
        outputChannel: import("@sinclair/typebox").TString;
        producerNodeIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        done: import("@sinclair/typebox").TBoolean;
        autoDoneAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TAny>;
    }>>;
    _id: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    inputItems: import("@sinclair/typebox").TArray<TObject<{
        itemId: import("@sinclair/typebox").TString;
        position: import("@sinclair/typebox").TInteger;
        nodeId: import("@sinclair/typebox").TString;
        outputChannel: import("@sinclair/typebox").TString;
        inputChannel: import("@sinclair/typebox").TString;
    }>>;
    depth: import("@sinclair/typebox").TInteger;
    taskId: import("@sinclair/typebox").TString;
    flowId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>;
    lowerFlowIds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TString]>>>;
    done: import("@sinclair/typebox").TBoolean;
    consumerId: import("@sinclair/typebox").TString;
    workerId: import("@sinclair/typebox").TString;
    numAvailable: import("@sinclair/typebox").TInteger;
    numTaken: import("@sinclair/typebox").TInteger;
    allTaken: import("@sinclair/typebox").TBoolean;
}>;
export declare const bundleQuery: TObject<{
    _id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    taskId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    consumerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    workerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    done: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    flowId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    consume: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export declare type BundleQuery = Static<typeof bundleQuery>;
export declare type Bundle = Static<typeof bundle>;
export declare type BundleRead = Static<typeof bundleRead>;
export {};
