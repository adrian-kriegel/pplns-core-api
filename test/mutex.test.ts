
import { ObjectId, UpdateResult } from 'mongodb';

import collection from '../src/storage/database';
import Mutex, { MutexOptions } from '../src/util/mutex';

type TestDoc = { _id: ObjectId; count: number };

const coll = collection<TestDoc>('mutext-test');

const sleep = (ms : number) => 
  new Promise(
    (resolve) => setTimeout(resolve, ms),
  )
;

let _id : ObjectId;

beforeAll(async () => 
{
  const { insertedId } = await coll.insertOne({ count: 0 });

  _id = insertedId;
});

describe('Mutex', () => 
{
  const numConcurrentCalls = 20;

  jest.setTimeout(numConcurrentCalls * 200);

  // helper array to be able to concurrently call using calls.map
  const calls = [...Array(numConcurrentCalls)];

  const validateResults = (results : UpdateResult[]) => 
  {
    expect(results.length)
      .toBe(numConcurrentCalls);

    results.forEach(
      (r) => expect(r.matchedCount).toBe(1),
    );
  };

  const unsafeFunction = async () => 
  {
    const doc = await coll.findOne({ _id });

    sleep(10);

    return coll.updateOne({ _id }, { $set: { count: doc.count + 1 } });
  };


  const testMutex = async (options : MutexOptions) => 
  {
    // reset the document and test again using mutex  
    await coll.updateOne({ _id }, { $set: { count: 0 } });

    const goodResults = await Promise.all(
      calls.map(
        async () => 
        {
          const mutex = await new Mutex(_id.toHexString(), options).take();
          const result = await unsafeFunction();

          await mutex.free();

          return result;
        },
      ),
    );

    const doc = await coll.findOne({ _id });

    validateResults(goodResults);

    expect(doc.count).toBe(numConcurrentCalls);
  };


  it('unsafe function fails without mutex', async () => 
  {
    const badResults = await Promise.all(
      calls.map(
        () => unsafeFunction(),
      ),
    );
  
    const doc = await coll.findOne({ _id });
  
    validateResults(badResults);
  
    expect(doc.count).toBeLessThan(numConcurrentCalls);
  });

  it('Mutex makes unsafe function work locally.', () => 
  {
    return testMutex({ ignoreInternalTriggers: false });
  });

  it('Mutex makes unsafe function work in distributed servers.', () => 
  {
    return testMutex({ ignoreInternalTriggers: true });
  });
 
});
