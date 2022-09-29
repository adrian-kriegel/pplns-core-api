
import { Handler } from 'express';

const apiKeyParser : Handler = (
  req,
  res,
  next,
) => 
{
  // [!] TODO: actual API keys
  const key = req.header('X-API-Key');

  if (
    process.env.DISABLE_AUTH === 'true' || (
      key &&
      key === process.env.PPLNS_API_PASSWORD 
    )
  )
  {
    res.locals.apiClient = { id: req.header['X-API-User'] || 'anonymous' };
  }

  next();
};

export default apiKeyParser;
