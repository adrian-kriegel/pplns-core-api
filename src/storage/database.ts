
import Connection from '@unologin/server-common/lib/general/database';

import {
  Bundle,
  DataItem,
  Node,
  Task,
  Worker,
} from '../schemas/pipeline';

import indexes from './db-indexes';

const db = new Connection(
  process.env.DB_CONNECTION_STR as string,
  process.env.DB_NAME as string,
  indexes,
  process.env.SETUP_DB === 'true',
);

export const connection = db;

/**
 * shorthand for db.collection<T>(cname)
 * @param cname name of the collection
 * @returns collection
 */
export default function collection<T=any>(cname: string)
{
  return db.collection<T>(cname);
}


export const bundles = collection<Bundle>('bundles');

export const nodes = collection<Node>('nodes');

export const dataItems = collection<DataItem>('dataItems');

export const tasks = collection<Task>('tasks');

export const workers = collection<Worker>('workers');
