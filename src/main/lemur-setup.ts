
import { LemurRouter } from 'express-lemur';

import ajv from '@unologin/server-common/lib/schemas/ajv-setup';

import {
  defaultRestOptions,
} from 'express-lemur/lib/rest/rest-router';

import { LemurOptions } from 'express-lemur/lib/router';
import logger from './logger';

export const lemurOptions : LemurOptions =
{
  ...defaultRestOptions,
  method: 'POST',
  ajv,
  logger,
  timeout: 20000,
};

LemurRouter.setOptions('rest', lemurOptions);
