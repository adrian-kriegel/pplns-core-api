
import './env-setup';
import './lemur-setup';

import express from 'express';
import RestRouter from 'express-lemur/lib/rest/rest-router';
import { connection } from '../storage/database';

import cookieParser from 'cookie-parser';
import bundles from '../api/bundles';
import dataItems from '../api/data-items';
import nodes from '../api/nodes';
import tasks from '../api/tasks';

const app = express();

export = app;

// TODO: also add logger (see any other api)
app.use(connection.expressSetup);

app.use(cookieParser());
app.use(express.json());

const restAPI = new RestRouter('rest');

restAPI.addResource(bundles);
restAPI.addResource(dataItems);
restAPI.addResource(nodes);
restAPI.addResource(tasks);

// @ts-ignore TODO: check why "express" does not exist on RestRouter according to TS
app.use(restAPI.express());
