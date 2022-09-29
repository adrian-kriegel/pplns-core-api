
/**
 * Handles tracking consumption of bundles and their expiration.
 * 
 * There is always one active timer waiting to delete the most relevant 
 * consumption (the one with the closest expiresAt).
 * 
 * Once this timer executes, the consumption will be deleted and the next most relevant consumption is
 * set as the new most relevant consumption.
 * 
 * TODO: test
 * 
 * TODO: If the core-api is deployed as a lambda function or similar, 
 *       this module should not execute any timers.
 *       A separate worker should be responsible.
 * 
 */

import { notFound } from 'express-lemur/lib/errors';
import { ObjectId } from 'mongodb';
import { isLambda } from '../main/env-setup';
import { bundles } from '../storage/database';
import { requestWorkerOperation } from './background-worker';


/**
 * "Un-consume" a bundle.
 * @param bundleId bundleId
 * @param consumptionId consumptionId
 * @returns Promise<void>
 * @throws 404 if not found
 */
export async function unconsume(
  bundleId : ObjectId,
  consumptionId: ObjectId,
)
{
  const bundle = await bundles.updateOne(
    { 
      _id: bundleId,
      consumptions: 
      {
        $elemMatch: 
        {
          _id: consumptionId,
          done: false,
        },
      },
    },
    {
      $inc: { numTaken: -1 },
      $set: { allTaken: false },
      $pull: { consumptions: { _id: consumptionId } },
    },
  );

  if (bundle.matchedCount !== 1)
  {
    throw notFound()
      .msg('Bundle not found or consumption done.');
  }
}

type Timeout = ReturnType<typeof setTimeout>;

type ExpTimer = 
{
  timeout: Timeout;
  expiresAt: Date;
}

// handle of current shortest timeout (highest priority expiration)
let shortestTimeout : ExpTimer | null = null;

/**
 * Initializes timeout to automatically unconsume the specified bundle.
 * @param bundleId bundleId
 * @param consumptionId consumptionId
 * @param expiresAt expiresAt
 * @param force set to true to override current highest priority timer
 * 
 * @returns void
 */
export function initConsumptionExpiration(
  bundleId : ObjectId,
  consumptionId : ObjectId,
  expiresAt : Date,
  force = false,
)
{
  if (isLambda)
  {
    return;
  }

  if (
    // force override
    force || 
    // no timer initialized yet
    !shortestTimeout || 
    // new timer is more relevant than the current most relevant timer
    expiresAt < shortestTimeout.expiresAt
  )
  {
    // prevent the current timeout from executing (most importanlty from leaking)
    clearTimeout(shortestTimeout?.timeout);

    shortestTimeout = 
    {
      expiresAt,
      timeout: setTimeout(
        async () => unconsumeCascade(bundleId, consumptionId),
        expiresAt.getTime() - Date.now(),
      ),
    };
  }
}

/**
 * @returns most relevant timer
 */
export function getCurrentTimer()
{
  return shortestTimeout;
}

/**
 * @param ignoreConsumptionId ignoreConsumptionId
 * @returns currently most relevant consumtion 
 */
export function findNextExpiringConsumption(
  ignoreConsumptionId?: ObjectId,
)
{
  return bundles.find(
    {
      consumptions: 
      {
        $elemMatch:
        {
          done: false,
          expiresAt: { $ne: null },
          _id: { $ne: ignoreConsumptionId },
        },
      },
    },
    {
      projection: { 'consumptions.$': 1 },
    },
  ).sort(
    {
      'consumptions.expiresAt': 1,
    },
  )
    .limit(1)
    .next()
  ;
}

/**
 * Automatically initializes the most relevant expiration timer from the database.
 * @param ignoreConsumptionId a consumption id to ignore
 * @returns Promise
 */
export async function autoInitConumptionExpiration(
  ignoreConsumptionId?: ObjectId,
)
{
  const next = await findNextExpiringConsumption(ignoreConsumptionId);

  if (next)
  {
    return initConsumptionExpiration(
      next._id,
      next.consumptions[0]._id,
      next.consumptions[0].expiresAt,
      true,
    );
  }
  else 
  {
    shortestTimeout = null;
  }
}

/**
 * Unconsumes specified consumption, then calls initConsumptionExpiration on 
 * the next most relevant expiring consumption. 
 * 
 * @param bundleId bundleId
 * @param consumptionId consumptionId
 * @returns Promise
 */
function unconsumeCascade(
  bundleId : ObjectId,
  consumptionId: ObjectId,
)
{
  return Promise.all(
    [
      // TODO: catch any errors except "not found"
      unconsume(bundleId, consumptionId).catch(() => null),
      requestWorkerOperation(
        () => autoInitConumptionExpiration(consumptionId),
      ),
    ],
  );
}

