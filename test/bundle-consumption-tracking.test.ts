
import { APIError } from 'express-lemur/lib/errors';
import { ObjectId } from 'mongodb';

import dataItemsApi from '../src/api/data-items';

import {
  findNextExpiringConsumption,
  getCurrentTimer,
  unconsume,
} from '../src/pipeline/bundle-consumptions';

import { bundles, connection } from '../src/storage/database';

import { InspectNode } from './util/inspect-node';
import { createTask } from './util/pipeline-setups';
import SourceNode from './util/source-node';


test('Consumptions are tracked when consuming bundles.', async () => 
{
  const taskId = await createTask();

  const src = await new SourceNode(taskId).register();

  const target = await new InspectNode(
    taskId, 
    [{ nodeId: src.nodeId as ObjectId, outputChannel: 'data' }],
  ).register();

  await Promise.all(
    [
      src.emit('cosumtion tracking example 1'),
      src.emit('cosumtion tracking example 2'),
      src.emit('cosumtion tracking example 3'),
      src.emit('cosumtion tracking example 4'),
    ],
  );

  const inputs = await target.consume();

  for (const input of inputs)
  {
    expect(input.consumptionId).toBeTruthy();
    expect(input.consumptions.length).toBe(1);
    expect(input.consumptions[0]._id.toHexString())
      .toBe(input.consumptionId?.toHexString())
    ;

    expect(input.consumptions[0].expiresAt).toBeNull();

    expect(input.consumptions[0].done).toBe(false);
  }

  // no expiration timer updates should have been triggered

  expect(getCurrentTimer()).toBeNull();

  expect(await findNextExpiringConsumption()).toBeNull();

});


test(
  'Consumption with lowest expiration date will be tracked by timeout.',
  async () => 
  {
    const taskId = await createTask();

    const src = await new SourceNode(taskId).register();

    const target = await new InspectNode(
      taskId, 
      [{ nodeId: src.nodeId as ObjectId, outputChannel: 'data' }],
    ).register();

    await Promise.all(
      [
        src.emit('cosumtion tracking example 1'),
        src.emit('cosumtion tracking example 2'),
        src.emit('cosumtion tracking example 3'),
        src.emit('cosumtion tracking example 4'),
      ],
    );

    const [bundle] = await target.consume({ limit: 1, unconsumeAfter: 10 });
    
    const con = bundle.consumptions[0];

    expect(con.expiresAt).toBeInstanceOf(Date);

    const timer = getCurrentTimer();

    expect(timer?.expiresAt).toStrictEqual(con.expiresAt);

    expect(
      (await findNextExpiringConsumption())?.consumptions[0],
    ).toStrictEqual(con);

    // consume another bundle but with a longer expiry

    const [bundle2] = await target.consume({ limit: 1, unconsumeAfter: 10000 });

    // timer should be unchanged
    expect(timer?.expiresAt).toStrictEqual(con.expiresAt);

    expect(
      (await findNextExpiringConsumption())?.consumptions[0],
    ).toStrictEqual(con);

    expect(
      // ignoring the current consumption, the next one should be found
      (await findNextExpiringConsumption(con._id))?.consumptions[0],
    ).toStrictEqual(bundle2.consumptions[0]);


    // consume another bundle but with a shorter expiry

    const [bundle3] = await target.consume({ limit: 1, unconsumeAfter: 1 });
    
    const con3 = bundle3.consumptions[0];

    // timer should have changed
    expect(getCurrentTimer()?.expiresAt).toStrictEqual(con3.expiresAt);

    expect(
      (await findNextExpiringConsumption())?.consumptions[0],
    ).toStrictEqual(con3);

  },
);

test.todo(
  'Consumptions will be undone after expirty date iff consumption.done=false.',
);

test(
  'Consumptions will update "done" after an item is submitted with their id.',
  async () => 
  {
    await connection.getDB().dropDatabase();
    await connection.setupDB(connection.getDB());

    const taskId = await createTask();

    const src = await new SourceNode(taskId).register();

    const target = await new InspectNode(
      taskId, 
      [{ nodeId: src.nodeId as ObjectId, outputChannel: 'data' }],
    ).register();

    await Promise.all(
      [
        src.emit('cosumtion tracking example 1'),
      ],
    );

    const [bundle] = await target.consume({ limit: 1, unconsumeAfter: 10 });

    expect(
      (await findNextExpiringConsumption())?._id,
    ).toStrictEqual(bundle._id);

    await dataItemsApi.post?.(
      { nodeId: target.nodeId as ObjectId, taskId },
      {
        ...bundle.items[0],
        consumptionId: bundle.consumptionId as ObjectId,
      },
      null as any,
      null as any,
    );

    // there should not be any expiring bundles left
    expect(await findNextExpiringConsumption()).toBeNull();

    const updatedBundle = await bundles.findOne({ _id: bundle._id });

    // before
    expect(bundle?.consumptions[0].done).toBe(false);

    // after
    expect(updatedBundle?.consumptions[0].done).toBe(true);

    // should be the same except for "done" being true now
    expect(updatedBundle?.consumptions.map((c) => ({ ...c, done: false})))
      .toStrictEqual(bundle?.consumptions);

    // unconsume should throw and not do anything after consumption is "done"
    await expect(
      () => unconsume(bundle._id, bundle.consumptions[0]._id),
    ).rejects.toBeInstanceOf(APIError);

    // call to "unconsume" should not change the bundle
    expect(
      await bundles.findOne({ _id: bundle._id }),
    ).toStrictEqual(updatedBundle);
  },
);

test.todo(
  'Items cannot be submitted twice with the same consumptionId',
);
