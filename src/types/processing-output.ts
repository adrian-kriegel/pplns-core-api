
import { Type, Static } from '@unologin/typebox-extended/typebox';

// describes the class of output
export enum LabelType 
{
  box = 'box',
  heatMap = 'heat_map',
  polygon = 'polygon',
}

// describes what the output represents
export enum OutputType
{
  regionOfInterest = 'roi',
}

export const labelType = Type.Enum(LabelType);
export const outputType = Type.Enum(OutputType);

export const boxLabel = Type.Object(
  {
    labelType: Type.Literal(LabelType.box),
    // box labels can only be a roi
    outputType: Type.Literal(OutputType.regionOfInterest),
    // any detected objects above the threshold
    objectness: Type.Number(),
    // class -> class score
    objects: Type.Record(Type.String(), Type.Number()),
    // start x,y end x,y in relative coordinates
    box: Type.Tuple(
      [Type.Number(), Type.Number(), Type.Number(), Type.Number()],
    ),
  },
);

export type BoxLabel = Static<typeof boxLabel>;

export const label = Type.Union(
  [
    boxLabel,
  ],
);

export type Label = Static<typeof label>;

// processing outputs can be labels or other things such as gradients, scale spaces etc.
export const processingOutput = Type.Union(
  [label],
);
