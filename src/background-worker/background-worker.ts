
import {
  autoInitConumptionExpiration,
  getCurrentTimer,
} from '../pipeline/bundle-consumptions';

import { processBundleRequests } from '../pipeline/item-bundler-queue';
import { ping } from './background-worker-status';

type Timeout = ReturnType<typeof setTimeout>;
type Interval = ReturnType<typeof setInterval>;

let bundlerTimeout : Timeout | null = null;
let expirationRefreshInterval : Interval | null = null;

let running = false;

/**
 * Periodically runs any background tasks that cannot (or should not) be 
 * performed by the actual api for either performance reasons or to avoid race conditions.
 * 
 * There should only ever one instance of the worker running.
 * 
 * @returns void
 */
export function startWorker()
{
  running = true;

  startBundleExpirationWorker();
  bundleDoneItems();

  // refresh the expiration worker every so often
  // TODO: add a callback that triggers once the current timer is set to null
  expirationRefreshInterval = setInterval(
    () => 
    {
      // if the expiration worker has stopped (because there are no more consumptions to track)
      if (!getCurrentTimer())
      {
        startBundleExpirationWorker();
      }
    },
    60000,
  );
}

/**
 * Runs a function only if the worker is running.
 * @param fnc function to run
 * @returns same as fnc or nothing if worker has been stopped
 */
export function requestWorkerOperation(
  fnc : () => any,
)
{
  ping();
  if (running)
  {
    return fnc();
  }
}

/**
 * Clears all worker related timeouts and stops the worker.
 * @returns void
 */
export function stopWorker()
{
  running = false;
  clearTimeout(bundlerTimeout);
  clearTimeout(getCurrentTimer().timeout);
  clearInterval(expirationRefreshInterval);
}

/**
 * Puts all "done" items into bundles for their consumers to consume.
 * @returns Promise
 */
export function bundleDoneItems()
{
  return processBundleRequests()
    .then(
      (num) => 
      {
        if (num)
        {
          console.log(
            `[Bundler] Pushed ${num} items into their destination bundles.`,
          );
        }

        requestWorkerOperation(
          () => bundlerTimeout = setTimeout(bundleDoneItems, 1000),
        );
      },
    )
  ;
}

/**
 * Starts the timers for any bundle consumption expirations
 * Alias for autoInitConumptionExpiration from 'bundle-consumptions'
 * @returns Promise
 */
export function startBundleExpirationWorker()
{
  return autoInitConumptionExpiration();
}
