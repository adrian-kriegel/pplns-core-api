
import { LemurRouter } from 'express-lemur';
import { listFileSystemWorkers } from '../pipeline/worker-management';

const api = new LemurRouter('rest');

export default api.express();

api.add(
  {
    route: '/find-workers',
    method: 'GET',

    title: 'Find worker definitions.',

    // eslint-disable-next-line max-len
    description: 'Returns list of local worker definitions from the file system.',

    callback: listFileSystemWorkers,  
  },
);
