/**
 * TODO : implement mongodb ChangeStream
 */


import { MongoError } from 'mongodb';
import collection, { connection } from '../storage/database';

export type MutexDoc = 
{
  _id: string;
}

const mutexes = collection<MutexDoc>('mutexes');

export type MutexOptions = 
{
  // set to true to disable internal mutex release (mainly used for testing)
  ignoreInternalTriggers?: boolean;
};


/**
 * Replacement for when collection.watch is not available.
 * 
 */
class MutexChangeStream
{
  pollingTime = 5;

  pollingTimeout = 30000;

  interval : ReturnType<typeof setInterval> | null = null;
  timeout : ReturnType<typeof setTimeout> | null = null;

  open : boolean = false;

  //  all mutex instances connected to this stream
  mutexes : Mutex[] = [];

  /** */
  constructor(private mutexId: string)
  {
    connection.onDisconnect(() => this.close());
  }

  /**
   * @param mutex mutex
   * @returns void
   */
  push(mutex : Mutex)
  {
    this.mutexes.push(mutex);

    if (!this.open)
    {
      this.start();
    }
  }

  /**
   * Attempts to take the mutex from the database.
   * @returns Promise<void | DeleteResult> 
   */
  private attemptTake()
  {
    return mutexes.insertOne({ _id: this.mutexId })
      .then(() => this.trigger(true))
      .catch(
        (e) =>
        {
          if (
            !(
              e instanceof MongoError &&
              e.code === 11000
            )
          ) 
          {
            this.emitError(e);
          }
        },  
      )
    ;
  }

  /**
   * Start listening for changes.
   * @returns void
   */
  private start()
  {
    this.open = true;

    this.attemptTake();

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
  }

  /** @returns void */
  initTimeout()
  {
    clearTimeout(this.timeout);

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
    this.open = false;
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
    this.close();

    if (this.mutexes.length > 0)
    {
      // TODO: reject in the correct mutex
      this.mutexes[0].reject(e);
    }
    else 
    {
      throw e;
    }
  }

  /**
   * emits the change event
   * @param isInternalRelease set to true if the event comes from a mutex on this server instance 
   * @returns Promise 
   */
  trigger(isInternalRelease = false) 
  {
    if (this.mutexes.length > 0)
    {
      const resolveMutex = () => 
      {
        // re-initialize the timeout
        this.initTimeout();

        // resolve the mutex
        this.mutexes.pop().resolve();
      };

      if (isInternalRelease)
      {
        resolveMutex();
      }
      else 
      {
        this.attemptTake();
      }
    }
    else 
    {
      return this.close();
    }
  }

  /** @returns void */
  close()
  {
    delete Mutex.changeStreamsByMutexId[this.mutexId];

    this.clearTimers();
    
    // make the mutex available for other servers
    return mutexes.deleteOne({ _id: this.mutexId });
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
  private changeStream : MutexChangeStream | null;

  public static changeStreamsByMutexId : 
  { [mutexId: string]: MutexChangeStream } = {};

  public resolve : (() => void) | null = null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public reject : ((e : Error) => void) | null = null;

  /** */
  constructor(
    private _id : string,
    public options : MutexOptions = defaultMutexOptions,
  ) {}

  /**
   * @returns Promise which resolves once the resource is taken
   */
  take()
  {
    return new Promise<Mutex>(
      (resolve, reject) => 
      {
        this.resolve = () => resolve(this);
        this.reject = reject;

        this.initListener();
      },
    );
  }

  /**
   * @param resolve resolve function
   * @returns void
   */
  private initListener()
  {
    // initialize a change stream for this mutex id if it has not been initialized already
    this.changeStream = 
      (
        Mutex.changeStreamsByMutexId[this._id] ||= 
          new MutexChangeStream(this._id)
      )
    ;

    this.changeStream.push(this);
  }

  /**
   * @returns Promise
   */
  free()
  {
    if (!this.changeStream)
    {
      throw new Error('Tried to free mutex that has not been initialized.');
    }

    if (this.options.ignoreInternalTriggers)
    {
      return mutexes.deleteOne({ _id: this._id });
    }
    else 
    {
      return this.changeStream.trigger(true);
    }
  }
}
