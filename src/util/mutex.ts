
import { ChangeStream } from 'mongodb';
import collection, { connection } from '../storage/database';

export type MutexDoc = 
{
  _id: string;
}

const mutexes = collection<MutexDoc>('mutexes');

type MockChange<Doc extends { _id: any }> =
{
  operationType: string;
  fullDocument: { _id: Doc['_id']; };
  isInternalRelease : boolean;
}

export type MutexOptions = 
{
  // set to true to disable internal mutex release (mainly used for testing)
  ignoreInternalTriggers?: boolean;
};

type MockChangeCallback = (
  change : MockChange<MutexDoc> | null,
  e?: Error,
) => void;

const changeStreamsByMutexId : { [mutexId: string]: MockChangeStream[] } = 
{

};

/**
 * Replacement for when collection.watch is not available.
 * 
 */
class MockChangeStream
{
  pollingTime = 5;

  pollingTimeout = 30000;

  callback : MockChangeCallback | null = null;

  interval : ReturnType<typeof setInterval> | null = null;
  timeout : ReturnType<typeof setTimeout> | null = null;

  /** */
  constructor(private mutexId: string)
  {
    changeStreamsByMutexId[this.mutexId] ||= [];

    changeStreamsByMutexId[this.mutexId].push(this);

    connection.onDisconnect(() => this.close());
  }

  /**
   * @param _ event
   * @param callback callback
   * @returns void
   */
  on(
    _ : 'change',
    callback : MockChangeCallback,
  )
  {
    this.callback = callback;

    this.interval = setInterval(
      async () => 
      {
        if (connection.isConnected())
        {
          try 
          {
            const result = await mutexes.findOne(
              { _id: this.mutexId },
            );

            if (!result)
            {
              this.trigger();
            }
          }
          catch (e)
          {
            this.emitError(e);
          }
        }
        else 
        {
          this.emitError(new Error('[Mutex] Connection has been closed.'));
        }
      },
      this.pollingTime,
    );

    this.timeout = setTimeout(
      () => 
      {
        this.close();
        throw new Error('Mutex timeout ' + this.mutexId);
      },
      this.pollingTimeout,
    );
  }

  /** @returns void  */
  clearTimers()
  {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
  }

  /**
   * 
   * @param e error
   * @returns void
   */
  emitError(e : Error)
  {
    this.clearTimers();
    this.callback?.(null, e);
  }

  /**
   * emits the change event
   * @param isInternalRelease set to true if the event comes from a mutex on this server instance 
   * @returns void
   */
  trigger(isInternalRelease = false) 
  {
    this.callback?.(
      {
        fullDocument: { _id: this.mutexId },
        operationType: 'TODO: I have not found any doc on this...',
        isInternalRelease,
      },
    );
  }

  /** @returns void */
  close()
  {
    this.clearTimers();
  }
}

const defaultMutexOptions : MutexOptions = 
{
  ignoreInternalTriggers: false,
};

/**
 * Implements a mutex that works across multiple instances of this prgram.
 */
export default class Mutex
{
  private changeStream : ChangeStream<MutexDoc> | MockChangeStream;

  private isStreamOpen = false;

  /** */
  constructor(
    private _id : string,
    private options : MutexOptions = defaultMutexOptions,
  )
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
        mutexes.insertOne(
          {
            _id: this._id,
          },
        )
          .then(() => 
          {
            this.changeStream.close();
            resolve(this);
          })
          .catch((e) => 
          {
            if (e.code === 11000)
            {
              if (!this.isStreamOpen)
              {
                this.isStreamOpen = true;
                this.changeStream.on('change', (change, err) => 
                {
                  if (!err)
                  {
                    if (
                      change.fullDocument._id === this._id
                    )
                    {
                      if (change.isInternalRelease)
                      {
                        this.changeStream.close();
                        resolve(this);
                      }
                      else 
                      {
                        // the mutex MIGHT be free, so attempt to take again
                        this.take()
                          .then(resolve)
                          .catch(reject)
                        ;
                      }
                    }
                  }
                  else 
                  {
                    reject(err);
                  }
                });
                
              }
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
   * @returns Promise
   */
  free()
  {
    // remove own change stream
    changeStreamsByMutexId[this._id].splice(
      changeStreamsByMutexId[this._id].findIndex(
        (s) => s === this.changeStream,
      ),
      1,
    );

    const nextStream = this.options.ignoreInternalTriggers ?
      null : 
      changeStreamsByMutexId[this._id].pop();

    if (nextStream)
    {
      return nextStream.trigger(true);
    }
    else 
    {
      return mutexes.deleteOne(
        { _id: this._id },
      );
    }
  }
}
