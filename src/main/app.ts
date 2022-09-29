
import './env-setup';
import './lemur-setup';

import express from 'express';
import RestRouter from 'express-lemur/lib/rest/rest-router';
import cookieParser from 'cookie-parser';

import cors from '../middleware/cors';
import unologin from '../middleware/unologin';

import { connection } from '../storage/database';

import bundles from '../api/bundles';
import dataItems from '../api/data-items';
import nodes from '../api/nodes';
import tasks from '../api/tasks';
import workers from '../api/workers';

import requestLogger from '../middleware/request-logger';
import util from '../api/util';

import jsonQueryParser from '../middleware/json-query-parser';
import apiKeyParser from '../middleware/api-key-parser';
import { getUser } from '../util/express-util';

import {
  APIError,
  badRequest,
  isAPIError,
} from 'express-lemur/lib/errors';

import logger from './logger';

const app = express();

export = app;

app.use(cors);

app.use(logger.setup());

// TODO: also add logger (see any other api)
app.use(connection.expressSetup);

app.use(cookieParser());

app.all('*', apiKeyParser);

app.use(unologin);

app.all('*', (req, res, next) => 
{
  try 
  {
    if (getUser(res))
    {
      next();
    }
    else 
    {
      new Error('Invalid login.');
    }
  }
  catch (e)
  {
    res.send(toAPIError(e));
  }
});

app.use(jsonQueryParser);
app.use(express.json());

if (process.env.PRINT_ALL_REQUESTS)
{
  app.use(requestLogger);
}

app.use(util);

const restAPI = new RestRouter('rest');

restAPI.addResource(bundles);
restAPI.addResource(dataItems);
restAPI.addResource(nodes);
restAPI.addResource(tasks);
restAPI.addResource(workers);

app.use(restAPI.express());


/**
 * Turn anything into an APIError
 * @param e error
 * @returns APIError
 */
function toAPIError(e : unknown) : APIError
{
  if (isAPIError(e))
  {
    return e as APIError;
  }
  else if (e instanceof SyntaxError)
  {
    return badRequest()
      .msg('Syntax error in request.');
  }
  else 
  {
    return new APIError(500);
  }
}

app.use(
  // it is important that the error handler have 4 arguments for express to know what's up
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (error, _1, res, _3) => 
  {
    const err = toAPIError(error);

    res.status(err._code).send(
      { error: err },
    );
  },
);


