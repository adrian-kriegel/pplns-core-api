
import { ObjectId, UpdateResult } from 'mongodb';

import collection from '../src/storage/database';
import Mutex, { changeStreamsByMutexId, MutexOptions } from '../src/util/mutex';

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
  const numConcurrentCalls = 30;

  jest.setTimeout(numConcurrentCalls * 300);

  // helper array to be able to concurrently call using calls.map
  const calls = [...Array(numConcurrentCalls)].map((_, i) => i);
  
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

    // check that the control flow follows a linear, repeating order
    // if the functions were not protected by the mutex, the order would be arbitrary,
    // as the state of one process may interfere with the state of another
    let currentControlState : 'grant' | 'work' | 'free' = 'free';

    const expectedControlStateOrder = ['grant', 'work', 'free'];

    // checks if the control state is the expected successor to the current state
    // and sets the control state
    const setControlState = (s : typeof currentControlState) => 
    {
      const index = expectedControlStateOrder.findIndex(
        (state) => currentControlState === state,
      );

      const expectedState = expectedControlStateOrder[
        (index + 1) % expectedControlStateOrder.length
      ];

      expect(s).toBe(expectedState);

      currentControlState = s;
    };

    const goodResults = await Promise.all(
      calls.map(
        async () => 
        {
          const mutex = await new Mutex(_id.toHexString(), options).take();
          
          setControlState('grant');
          
          try 
          {
            const result = await unsafeFunction();
            setControlState('work');
            return result;
          }
          finally 
          {
            setControlState('free');
            await mutex.free();
          }
        },
      ),
    );

    const doc = await coll.findOne({ _id });

    validateResults(goodResults);

    expect(doc.count).toBe(numConcurrentCalls);

    // the local "queue" should be empty after all operations have finished
    expect(changeStreamsByMutexId[_id.toHexString()].length)
      .toBe(0);
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
