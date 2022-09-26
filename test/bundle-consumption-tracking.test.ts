

test.todo('Consumptions are tracked when consuming bundles.');

test.todo('Consumptions without expiry date do not cause any timer updates.');

test.todo(
  'Consumption with lowest expiration date will be tracked by timeout.',
);

test.todo(
  'Consumptions will be undone after expirty date iff consumption.done=false.',
);

test.todo(
  'Consumptions will update "done" after an item is submitted with their id.',
);

test.todo(
  'Items cannot be submitted twice with the same consumptionId',
);
