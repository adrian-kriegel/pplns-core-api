
import db from '../storage/database';

import { objectId } from '@unologin/server-common/lib/schemas/general';

import { Type, Static } from '@unologin/typebox-extended/typebox';

// describes a node used for some task
// nodes with the same taskId describe the entire pipeline
export const taskNode = Type.Object(
  {
    _id: objectId,
    taskId: objectId,
    node: Type.String(),
    parameters: Type.Object({ }, { additionalProperties: true }),
  },
);

export type TaskNode = Static<typeof taskNode>;

export const nodeSetups = db<TaskNode>('nodeSetups');
