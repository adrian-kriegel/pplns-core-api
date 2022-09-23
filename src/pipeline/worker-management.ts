
import { Worker } from '../pipeline/schemas';

import { exec } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * Finds list of workers in the local file system.
 * 
 * TODO: parse using ajv to check schema and apply any keyword schemas
 * 
 * @returns Promise<Worker[]>
 */
export function listFileSystemWorkers()
{
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
