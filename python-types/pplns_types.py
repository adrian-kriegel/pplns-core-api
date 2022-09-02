# Do not edit manually!
# This file has been automatically generated.
# Run yarn build-schemas && yarn build-python-types to regenerate.

import typing

Task = typing.TypedDict('Task',{
'_id': str,
'createdAt': str,
'title': str,
'description': typing.NotRequired[str],
'params': dict[str, typing.Any],
'owners': list[str]
})

DataTypeDefinition = typing.Any

DataTypeRecord = dict[str, typing.Any]

Worker = typing.TypedDict('Worker',{
'_id': str,
'createdAt': str,
'key': str,
'title': str,
'description': typing.NotRequired[str],
'inputs': dict[str, typing.Any],
'outputs': dict[str, typing.Any],
'params': dict[str, typing.Any]
})

WorkerWrite = typing.TypedDict('WorkerWrite',{
'key': str,
'title': str,
'description': typing.NotRequired[str],
'inputs': dict[str, typing.Any],
'outputs': dict[str, typing.Any],
'params': dict[str, typing.Any]
})

TaskWrite = typing.TypedDict('TaskWrite',{
'title': str,
'description': typing.NotRequired[str],
'params': dict[str, typing.Any],
'owners': list[str]
})

Node = typing.TypedDict('Node',{
'_id': str,
'createdAt': str,
'taskId': str,
'inputs': list[typing.TypedDict('name.inputs.items',{
'nodeId': str,
'outputChannel': str,
'inputChannel': str
})],
'numExecutions': typing.NotRequired[int],
'params': typing.NotRequired[dict[str, typing.Any]],
'workerId': typing.NotRequired[str],
'internalWorker': typing.NotRequired[str],
'position': typing.TypedDict('name.position',{
'x': float,
'y': float
})
})

NodeWrite = typing.TypedDict('NodeWrite',{
'inputs': list[typing.TypedDict('name.inputs.items',{
'nodeId': str,
'outputChannel': str,
'inputChannel': str
})],
'numExecutions': typing.NotRequired[int],
'params': typing.NotRequired[dict[str, typing.Any]],
'workerId': typing.NotRequired[str],
'internalWorker': typing.NotRequired[str],
'position': typing.TypedDict('name.position',{
'x': float,
'y': float
})
})

NodeRead = typing.TypedDict('NodeRead',{
'_id': str,
'createdAt': str,
'taskId': str,
'inputs': list[typing.TypedDict('name.inputs.items',{
'nodeId': str,
'outputChannel': str,
'inputChannel': str
})],
'numExecutions': typing.NotRequired[int],
'params': typing.NotRequired[dict[str, typing.Any]],
'workerId': typing.NotRequired[str],
'internalWorker': typing.NotRequired[str],
'position': typing.TypedDict('name.position',{
'x': float,
'y': float
}),
'worker': typing.Union[
typing.TypedDict('name.worker.0',{
'_id': str,
'createdAt': str,
'key': str,
'title': str,
'description': typing.NotRequired[str],
'inputs': dict[str, typing.Any],
'outputs': dict[str, typing.Any],
'params': dict[str, typing.Any]
}),
typing.TypedDict('name.worker.1',{
'key': str,
'title': str,
'description': typing.NotRequired[str],
'inputs': dict[str, typing.Any],
'outputs': dict[str, typing.Any],
'params': dict[str, typing.Any]
})
]
})

FlowIdSchema = typing.Union[
str,
str
]

DataItem = typing.TypedDict('DataItem',{
'_id': str,
'createdAt': str,
'taskId': str,
'nodeId': str,
'outputChannel': str,
'flowId': typing.NotRequired[typing.Union[
str,
str
]],
'flowStack': typing.NotRequired[list[typing.TypedDict('name.flowStack.items',{
'flowId': typing.Union[
str,
str
],
'splitNodeId': str,
'numEmitted': int
})]],
'producerNodeIds': list[str],
'done': bool,
'autoDoneAfter': typing.NotRequired[int],
'data': list[typing.Any]
})

DataItemWrite = typing.TypedDict('DataItemWrite',{
'outputChannel': str,
'flowId': typing.NotRequired[typing.Union[
str,
str
]],
'flowStack': typing.NotRequired[list[typing.TypedDict('name.flowStack.items',{
'flowId': typing.Union[
str,
str
],
'splitNodeId': str,
'numEmitted': int
})]],
'done': bool,
'autoDoneAfter': typing.NotRequired[int],
'data': list[typing.Any]
})

DataItemQuery = typing.TypedDict('DataItemQuery',{
'_id': typing.NotRequired[str],
'taskId': typing.NotRequired[str],
'nodeId': typing.NotRequired[str],
'done': typing.NotRequired[bool],
'flowId': typing.NotRequired[typing.Union[
str,
str
]]
})

Bundle = typing.TypedDict('Bundle',{
'_id': str,
'createdAt': str,
'inputItems': list[typing.TypedDict('name.inputItems.items',{
'itemId': str,
'position': int,
'nodeId': str,
'outputChannel': str,
'inputChannel': str
})],
'depth': int,
'taskId': str,
'flowId': typing.Union[
str,
str
],
'lowerFlowIds': typing.NotRequired[list[typing.Union[
str,
str
]]],
'done': bool,
'consumerId': str,
'workerId': typing.NotRequired[str],
'numAvailable': int,
'numTaken': int,
'allTaken': bool
})

BundleRead = typing.TypedDict('BundleRead',{
'_id': str,
'createdAt': str,
'inputItems': list[typing.TypedDict('name.inputItems.items',{
'itemId': str,
'position': int,
'nodeId': str,
'outputChannel': str,
'inputChannel': str
})],
'depth': int,
'taskId': str,
'flowId': typing.Union[
str,
str
],
'lowerFlowIds': typing.NotRequired[list[typing.Union[
str,
str
]]],
'done': bool,
'consumerId': str,
'workerId': typing.NotRequired[str],
'numAvailable': int,
'numTaken': int,
'allTaken': bool,
'items': list[typing.TypedDict('name.items.items',{
'_id': str,
'createdAt': str,
'taskId': str,
'nodeId': str,
'outputChannel': str,
'flowId': typing.NotRequired[typing.Union[
str,
str
]],
'flowStack': typing.NotRequired[list[typing.TypedDict('name.flowStack.items',{
'flowId': typing.Union[
str,
str
],
'splitNodeId': str,
'numEmitted': int
})]],
'producerNodeIds': list[str],
'done': bool,
'autoDoneAfter': typing.NotRequired[int],
'data': list[typing.Any]
})]
})

BundleQuery = typing.TypedDict('BundleQuery',{
'_id': typing.NotRequired[str],
'taskId': typing.NotRequired[str],
'consumerId': typing.NotRequired[str],
'workerId': typing.NotRequired[str],
'done': typing.NotRequired[bool],
'flowId': typing.NotRequired[str],
'limit': typing.NotRequired[int],
'consume': typing.NotRequired[bool]
})
version = '0.0.1'
