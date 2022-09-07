
import { exec } from 'child_process';
import { LemurRouter } from 'express-lemur';
import { readFileSync } from 'fs';
import path from 'path';

const api = new LemurRouter('rest');

export default api.express();

api.add(
  {
    route: '/find-workers',
    method: 'GET',

    title: 'Find worker definitions.',

    // eslint-disable-next-line max-len
    description: 'Returns list of local worker definitions from the file system.',

    callback: () => 
    {
      const process = exec('echo ../*/pplns_workers/*.json');

      let files : string[];

      process.stdout.on('data', (str) => 
      {
        files = str.replace('\n', '').split(' ').map((p) => path.resolve(p));
      });

      return new Promise(
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
    },  
  },
);
