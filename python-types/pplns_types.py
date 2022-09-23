# Do not edit manually!
# This file has been automatically generated.
# Run yarn build-schemas && yarn build-python-types to regenerate.

import typing

from typing_extensions import NotRequired

Task = typing.TypedDict('Task',{
'_id': str,
'createdAt': str,
'title': str,
'description': NotRequired[str],
'params': dict[str, typing.Any],
'owners': list[str]
})

DataTypeDefinition = typing.Any

DataTypeRecord = dict[str, typing.Any]

Worker = typing.TypedDict('Worker',{
'_id': str,
'createdAt': str,
'title': str,
'description': NotRequired[str],
'inputs': dict[str, typing.Any],
'outputs': dict[str, typing.Any],
'params': dict[str, typing.Any]
})

WorkerWrite = typing.TypedDict('WorkerWrite',{
'_id': str,
'title': str,
'description': NotRequired[str],
'inputs': dict[str, typing.Any],
'outputs': dict[str, typing.Any],
'params': dict[str, typing.Any]
})

InternalWorker = typing.TypedDict('InternalWorker',{
'_id': str,
'title': str,
'description': NotRequired[str],
'inputs': dict[str, typing.Any],
'outputs': dict[str, typing.Any],
'params': dict[str, typing.Any]
})

TaskWrite = typing.TypedDict('TaskWrite',{
'title': str,
'description': NotRequired[str],
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
'numExecutions': NotRequired[int],
'params': NotRequired[dict[str, typing.Any]],
'workerId': NotRequired[str],
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
'numExecutions': NotRequired[int],
'params': NotRequired[dict[str, typing.Any]],
'workerId': NotRequired[str],
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
'numExecutions': NotRequired[int],
'params': NotRequired[dict[str, typing.Any]],
'workerId': NotRequired[str],
'position': typing.TypedDict('name.position',{
'x': float,
'y': float
}),
'worker': typing.Union[
typing.TypedDict('name.worker.0',{
'_id': str,
'createdAt': str,
'title': str,
'description': NotRequired[str],
'inputs': dict[str, typing.Any],
'outputs': dict[str, typing.Any],
'params': dict[str, typing.Any]
}),
typing.TypedDict('name.worker.1',{
'_id': str,
'title': str,
'description': NotRequired[str],
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

FlowStackSchema = list[typing.TypedDict('FlowStackSchema.items',{
'flowId': typing.Union[
str,
str
],
'splitNodeId': str,
'numEmitted': int
})]

DataItem = typing.TypedDict('DataItem',{
'_id': str,
'createdAt': str,
'taskId': str,
'nodeId': str,
'outputChannel': str,
'flowId': NotRequired[typing.Union[
str,
str
]],
'flowStack': NotRequired[list[typing.TypedDict('name.flowStack.items',{
'flowId': typing.Union[
str,
str
],
'splitNodeId': str,
'numEmitted': int
})]],
'producerNodeIds': list[str],
'done': bool,
'autoDoneAfter': NotRequired[int],
'data': list[typing.Any]
})

DataItemWrite = typing.TypedDict('DataItemWrite',{
'outputChannel': str,
'flowId': NotRequired[typing.Union[
str,
str
]],
'flowStack': NotRequired[list[typing.TypedDict('name.flowStack.items',{
'flowId': typing.Union[
str,
str
],
'splitNodeId': str,
'numEmitted': int
})]],
'done': bool,
'autoDoneAfter': NotRequired[int],
'data': list[typing.Any]
})

DataItemQuery = typing.TypedDict('DataItemQuery',{
'_id': NotRequired[str],
'taskId': NotRequired[str],
'nodeId': NotRequired[str],
'done': NotRequired[bool],
'flowId': NotRequired[typing.Union[
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
'lowerFlowIds': NotRequired[list[typing.Union[
str,
str
]]],
'done': bool,
'consumerId': str,
'workerId': NotRequired[str],
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
'lowerFlowIds': NotRequired[list[typing.Union[
str,
str
]]],
'done': bool,
'consumerId': str,
'workerId': NotRequired[str],
'numAvailable': int,
'numTaken': int,
'allTaken': bool,
'items': list[typing.TypedDict('name.items.items',{
'_id': str,
'createdAt': str,
'taskId': str,
'nodeId': str,
'outputChannel': str,
'flowId': NotRequired[typing.Union[
str,
str
]],
'flowStack': NotRequired[list[typing.TypedDict('name.flowStack.items',{
'flowId': typing.Union[
str,
str
],
'splitNodeId': str,
'numEmitted': int
})]],
'producerNodeIds': list[str],
'done': bool,
'autoDoneAfter': NotRequired[int],
'data': list[typing.Any]
})]
})

BundleQuery = typing.TypedDict('BundleQuery',{
'_id': NotRequired[str],
'taskId': NotRequired[str],
'consumerId': NotRequired[str],
'workerId': NotRequired[str],
'done': NotRequired[bool],
'flowId': NotRequired[str],
'limit': NotRequired[int],
'consume': NotRequired[bool]
})
version = '0.0.1'
