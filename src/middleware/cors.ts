/**
 * Handles CORS if not running on lambda. Otherwise, serverless will handle CORS.
 */

import express from 'express';
import { forbidden } from 'express-lemur/lib/errors';
 
// eslint-disable-next-line new-cap
const router = express.Router();
  
export default router;
  
// allow certain origins
// TODO: put this in env and join it with origins used in serverless.yml
const ALLOWED_ORIGINS = 
 [
   'http://label.localhost:8080',
   'https://login.unolog.in',
 ];
  
router.all('*', function(req, res, next) 
{
  const origin = req.headers.origin;
 
  if (
    !origin ||
     // some clients will send the string "null"
     origin === 'null' ||
     ALLOWED_ORIGINS.includes(origin))
  {
    res.setHeader(
      'Access-Control-Allow-Origin',
      origin || '*',
    );
  
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    );
      
    res.setHeader(
      'Access-Control-Allow-Headers', 
      'X-Requested-With,content-type',
    );
      
    res.setHeader(
      'Access-Control-Allow-Credentials',
      'true',
    );
  
    next();
  }
  else
  {
    res.send(
      forbidden()
        .msg('Origin not whitelisted!'),
    );
  }
});
  
router.options('*', (req, res) => 
{
  res.send('ok');
});
  
 
