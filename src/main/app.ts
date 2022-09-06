
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

const app = express();

export = app;

app.use(cors);

// TODO: also add logger (see any other api)
app.use(connection.expressSetup);

app.use(cookieParser());

app.use(unologin);

app.use(express.json());

if (process.env.PRINT_ALL_REQUESTS)
{
  app.use(requestLogger);
}

const restAPI = new RestRouter('rest');

restAPI.addResource(bundles);
restAPI.addResource(dataItems);
restAPI.addResource(nodes);
restAPI.addResource(tasks);
restAPI.addResource(workers);

app.use(restAPI.express());
