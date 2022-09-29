
import { Worker } from './schemas';

import { exec } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';
import { isLambda } from '../main/env-setup';

/**
 * Finds list of workers in the local file system.
 * 
 * TODO: parse using ajv to check schema and apply any keyword schemas
 * 
 * @returns Promise<Worker[]>
 */
export function listFileSystemWorkers() : Promise<Worker[]>
{
  // this function does not work on most "lambda"-like functions and there is no need to have it anyway
  if (isLambda)
  {
    return Promise.resolve([]);
  }

  const process = exec('echo ../*/pplns_workers/*.json');

  let files : string[] = [];

  process.stdout.on('data', (str) => 
  {
    files = str.replace('\n', '').split(' ').map((p) => path.resolve(p));
  });

  return new Promise<Worker[]>(
    (resolve) => 
    {
      process.on('exit', () => 
      {
        resolve(
          files.map((f) => JSON.parse(readFileSync(f).toString())),
        );
      });
    },
  );
}
