
import db from '../storage/database';

import { objectId } from '@unologin/server-common/lib/schemas/general';

import { Type, Static } from '@unologin/typebox-extended/typebox';

export enum CaptchaAudience 
{
  worker = 'worker',
  web = 'web',
  any = 'any',
}

export const nodeDescriptionYoloV3 = Type.Object(
  {
    nodeId: Type.Literal('node_yolo_v3'),

    parameters: Type.Object(
      {
        threshold: Type.Number({ minimum: 0, maximum: 1 }),
      },
    ),
  },
);

export const nodeDescriptionCaptchaMarker = Type.Object(
  {
    nodeId: Type.Literal('node_captcha_marker'),

    parameters: Type.Object(
      {
        audience: Type.Enum(CaptchaAudience),
        numCaptchas: Type.Number({ minimum: 0, maximum: 1 }),
      },
    ),
  },
);


export const nodeDescription = Type.Union(
  [
    nodeDescriptionYoloV3,
  ],
);

export type NodeDescription = Static<typeof nodeDescription>;

// describes a node used for some task
// nodes with the same taskId describe the entire pipeline
export const taskNode = Type.Object(
  {
    _id: objectId,
    taskId: objectId,
    node: nodeDescription,
  },
);

export type TaskNode = Static<typeof taskNode>;

export const nodeSetups = db<TaskNode>('nodeSetups');
