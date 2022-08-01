

/**
 * 
 * @param unwoundField string
 * @param keys keys expected in the document
 * @returns $group stage which undoes $unwind: unwoundField
 */
export function undoUnwind(unwoundField : string, keys : string[])
{
  return {
    $group:
    {
      ...Object.fromEntries(
        keys.map(
          (key) => [key, { $first: '$' + key }],
        ),
      ),
      _id: '$_id',
      [unwoundField]: { $push: '$'+unwoundField },
    },
  };
}
