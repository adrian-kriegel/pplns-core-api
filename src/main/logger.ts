
import db from '@unologin/server-common/lib/general/collections';

import Logger, { LogDocument } 
  from '@unologin/server-common/lib/general/logger';
import { isLambda } from '../main/env-setup';

const logs = db<LogDocument>('logs');

const logToDB = 
  (isLambda || process.env.LOG_ERRORS_TO_DB) &&
  !(process.env.LOG_ERRORS_TO_CONSOLE === 'true');

const logger = new Logger(
  logs,
  logToDB ? 'database' : 'console',
);

export const logAsync = logger.logAsync.bind(logger);

export default logger;
