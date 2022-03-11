
import db from '../storage/database';

import { objectId } from '@unologin/server-common/lib/schemas/general';

import { Type, Static } from '@unologin/typebox-extended/typebox';

export const image = Type.Object(
  {
    _id: objectId,
    taskId: objectId,
    src: Type.String(),

    outputs: Type.Array(processingOutput),
  },
);

export type Image = Static<typeof image>;

export const images = db<Image>('images');
