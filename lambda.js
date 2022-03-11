
const serverless = require('serverless-http');

const app = require('./src/main/app');

module.exports.handler = serverless(app);
