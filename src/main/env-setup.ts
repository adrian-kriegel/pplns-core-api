
import { config } from 'dotenv';
import { ObjectId } from 'mongodb';

config({ path: '.env.' + process.env.UNOLOGIN_ENV });

export const isLambda = !!process.env.LAMBDA_TASK_ROOT;

export const isTesting = process.env.UNOLOGIN_ENV === 'testing';

// unologin appId of the pipeline app
export const unologinAppId = new ObjectId(process.env.UNOLOGIN_APPID);


