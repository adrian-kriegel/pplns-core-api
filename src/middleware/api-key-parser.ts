
import { Handler } from 'express';

const apiKeyParser : Handler = (
  req,
  res,
  next,
) => 
{
  // [!] TODO: actual API keys
  if (
    process.env.DISABLE_AUTH === 'true' || (
      req.header['X-API-Key'] &&
      req.header['X-API-Key'] === process.env.PPLNS_API_PASSWORD 
    )
  )
  {
    res.locals.apiClient = { id: req.header['X-API-User'] || 'anonymous' };
  }

  next();
};

export default apiKeyParser;
