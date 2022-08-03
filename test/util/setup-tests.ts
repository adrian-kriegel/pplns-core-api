
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { config } from 'dotenv';

config({ path: '.env.test' });

import {
  dbName,
  connectFresh,
} from '@unologin/server-common/lib/test-utils/db-testing';

process.env.DB_NAME = dbName;

import * as unologin from '@unologin/node-api';

import agent from './unologin-agent';

import { createApiToken } from '@unologin/node-api/build/test-utils';
import { connection } from '../../src/storage/database';

beforeAll(connectFresh);
beforeAll(() => connection.connect());


// create a fake unologin API KEY
process.env.UNOLOGIN_API_KEY = createApiToken(
  process.env.UNOLOGIN_APPID as string,
);

beforeAll(() => 
{

  // this needs to be done after all imports to override the setup in src/api/access-control
  unologin.setup(
    {
      apiKey: process.env.UNOLOGIN_API_KEY,
      cookiesDomain: process.env.UNOLOGIN_COOKIES_DOMAIN,
      realm:
      {
        frontendUrl: process.env.UNOLOGIN_FRONTEND || 'https://unolog.in',
        apiUrl: process.env.UNOLOGIN_API || 'https://v1.unolog.in',
      },
      agent: agent,
      skipPublicKeyCheck: true,
    },
  );

});
