
import { assert404 } from 'express-lemur/lib/rest/rest-router';
import { Collection } from 'mongodb';

/**
 * TODO: types!
 * @param collection collection
 * @param query find query
 * @param update object
 * @returns updated resource
 */
export async function simplePatch<T>(
  collection : Collection<any>,
  query : object,
  update : object,
) : Promise<T>
{
  const doc = assert404(
    await collection.findOneAndUpdate(query, update),
  );

  return { ...doc.value, ...update } as any;
}
