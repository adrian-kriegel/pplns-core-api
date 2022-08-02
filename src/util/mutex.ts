
import { ChangeStream } from 'mongodb';
import collection from '../storage/database';

export type MutexDoc = 
{
  _id: string;
}

const mutexes = collection<MutexDoc>('mutexes');

type MockChange<Doc> =
{
  operationType: string;
  fullDocument: Doc;
}

/**
 * Replacement for when collection.watch is not available.
 */
class MockChangeStream
{
  pollingTime = 5;

  pollingTimeout = 10000;

  /** */
  constructor(private mutexId: string) {}

  /**
   * @param _ event
   * @param callback callback
   * @returns void
   */
  on(
    _ : 'change',
    callback : (change : MockChange<MutexDoc>) => void,
  )
  {
    const interval = setInterval(
      async () => 
      {
        const result = await mutexes.findOne(
          { _id: this.mutexId },
        );

        if (!result)
        {
          clearInterval(interval);

          callback(
            {
              fullDocument: { _id: this.mutexId },
              operationType: 'TODO: I have not found any doc on this...',
            },
          );
        }
      },
      this.pollingTime,
    );

    setTimeout(
      () => 
      {
        clearInterval(interval);
        throw new Error('Mutex timeout ' + this.mutexId);
      },
      this.pollingTimeout,
    );
  }

  /** @returns void */
  close() { }
}

/**
 * Implements a mutex that works across multiple instances of this prgram.
 */
export default class Mutex
{
  private changeStream : ChangeStream<MutexDoc> | MockChangeStream;

  /** */
  constructor(private _id : string)
  {
    if (process.env.MONGODB_IS_REPLICA_SET) 
    {
      this.changeStream = mutexes.watch();
    }
    else
    {
      this.changeStream = new MockChangeStream(_id);
    }
  }

  /**
   * @returns Promise which resolves once the resource is taken
   */
  take()
  {
    return new Promise<Mutex>(
      (resolve, reject) => 
      {
        mutexes.insertOne({ _id: this._id })
          .then(() => 
          {
            resolve(this);
          })
          .catch((e) => 
          {
            if (e.code === 11000)
            {
              this.changeStream.on('change', (change) => 
              {
                if (
                  change.fullDocument._id === this._id
                )
                {
                  // the mutex MIGHT be free, so attempt to take again
                  this.take()
                    .then(resolve)
                    .catch(reject)
                  ;
                }
              });
            }
            else 
            {
              reject(e);
            }
          })
        ;
      },
    );
  }

  /**
   * @returns update result
   */
  free()
  {
    return mutexes.deleteOne(
      { _id: this._id },
    );
  }
}
