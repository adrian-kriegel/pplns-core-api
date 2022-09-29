
import './env-setup';

import { startWorker } from '../pipeline/background-worker';
import { connection } from '../storage/database';

console.log('Connecting to database...');

connection.connect().then(
  () => 
  {
    console.log('Connected to database.');

    return startWorker();
  },
);
