# Do not edit manually!
# This file has been automatically generated.
# Run yarn build-schemas && yarn build-python-types to regenerate.

import typing

Task = typing.TypedDict('Task',{
'_id': str,
'createdAt': str,
'title': str,
'description': typing.Optional[str],
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
'description': typing.Optional[str],
'inputs': dict[str, typing.Any],
'outputs': dict[str, typing.Any],
'params': dict[str, typing.Any]
})

WorkerWrite = typing.TypedDict('WorkerWrite',{
'key': str,
'title': str,
'description': typing.Optional[str],
'inputs': dict[str, typing.Any],
'outputs': dict[str, typing.Any],
'params': dict[str, typing.Any]
})

TaskWrite = typing.TypedDict('TaskWrite',{
'title': str,
'description': typing.Optional[str],
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
'numExecutions': typing.Optional[int],
'params': typing.Optional[dict[str, typing.Any]],
'workerId': typing.Optional[str],
'internalWorker': typing.Optional[str],
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
'numExecutions': typing.Optional[int],
'params': typing.Optional[dict[str, typing.Any]],
'workerId': typing.Optional[str],
'internalWorker': typing.Optional[str],
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
'numExecutions': typing.Optional[int],
'params': typing.Optional[dict[str, typing.Any]],
'workerId': typing.Optional[str],
'internalWorker': typing.Optional[str],
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
'description': typing.Optional[str],
'inputs': dict[str, typing.Any],
'outputs': dict[str, typing.Any],
'params': dict[str, typing.Any]
}),
typing.TypedDict('name.worker.1',{
'key': str,
'title': str,
'description': typing.Optional[str],
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
'flowId': typing.Optional[typing.Union[
str,
str
]],
'flowStack': typing.Optional[list[typing.TypedDict('name.flowStack.items',{
'flowId': typing.Union[
str,
str
],
'splitNodeId': str,
'numEmitted': int
})]],
'producerNodeIds': list[str],
'done': bool,
'autoDoneAfter': typing.Optional[int],
'data': list[typing.Any]
})

DataItemWrite = typing.TypedDict('DataItemWrite',{
'outputChannel': str,
'flowId': typing.Optional[typing.Union[
str,
str
]],
'flowStack': typing.Optional[list[typing.TypedDict('name.flowStack.items',{
'flowId': typing.Union[
str,
str
],
'splitNodeId': str,
'numEmitted': int
})]],
'done': bool,
'autoDoneAfter': typing.Optional[int],
'data': list[typing.Any]
})

DataItemQuery = typing.TypedDict('DataItemQuery',{
'_id': typing.Optional[str],
'taskId': typing.Optional[str],
'nodeId': typing.Optional[str],
'done': typing.Optional[bool],
'flowId': typing.Optional[typing.Union[
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
'lowerFlowIds': typing.Optional[list[typing.Union[
str,
str
]]],
'done': bool,
'consumerId': str,
'workerId': str,
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
'lowerFlowIds': typing.Optional[list[typing.Union[
str,
str
]]],
'done': bool,
'consumerId': str,
'workerId': str,
'numAvailable': int,
'numTaken': int,
'allTaken': bool,
'items': list[typing.TypedDict('name.items.items',{
'_id': str,
'createdAt': str,
'taskId': str,
'nodeId': str,
'outputChannel': str,
'flowId': typing.Optional[typing.Union[
str,
str
]],
'flowStack': typing.Optional[list[typing.TypedDict('name.flowStack.items',{
'flowId': typing.Union[
str,
str
],
'splitNodeId': str,
'numEmitted': int
})]],
'producerNodeIds': list[str],
'done': bool,
'autoDoneAfter': typing.Optional[int],
'data': list[typing.Any]
})]
})

BundleQuery = typing.TypedDict('BundleQuery',{
'_id': typing.Optional[str],
'taskId': typing.Optional[str],
'consumerId': typing.Optional[str],
'workerId': typing.Optional[str],
'done': typing.Optional[bool],
'flowId': typing.Optional[str],
'limit': typing.Optional[int],
'consume': typing.Optional[bool]
})