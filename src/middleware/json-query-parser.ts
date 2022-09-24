
/**
 * TODO: move this to express-lemur to apply parsing only to query fields that are expected to be objects
 */

import { Handler } from 'express';
import { badRequest } from 'express-lemur/lib/errors';

// chars that indicate the start of a json expression
const jsonChars = '{[';

// middleware for parsing individual JSON-formatted query values
const handler : Handler = (req, res, next) =>
{
  for (const [key, value] of Object.entries(req.query))
  {
    if (typeof value === 'string')
    { 
      if (jsonChars.includes(value.charAt(0)))
      {
        try 
        {
          req.query[key] = JSON.parse(value);
        }
        catch (e)
        {
          res.status(400).send(
            badRequest().msg('cannot parse ' + value),
          );

          return;
        }
      }
    }
  }

  next();
};

export default handler;
