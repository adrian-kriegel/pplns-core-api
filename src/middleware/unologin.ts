
import * as unologin from '@unologin/node-api';

import { Errors, LemurRouter } from 'express-lemur';

import { isLambda } from '../main/env-setup';

const {
  parseLogin,
  loginEventHandler,
  onAuthError,
  logoutHandler,
} = unologin.express;

// disable secure cookies when running locally
if (process.env.UNOLOGIN_ENV === 'local')
{
  unologin.express.debug_useSecureCookies(false);
}

onAuthError(async (req, res) => 
{
  {
    // remove the invalid login tokens
    logoutHandler(req, res);
    res.status(401).send(
      {
        error: Errors.unauthorized()
          .msg(res.locals.unologin?.msg || 'unknown error'),
      },
    );
  }
});

const api = new LemurRouter('rest');

export default api.express();

api.add(
  {
    route: '/logout',
    callback: [
      logoutHandler,
      // simple result function to close the request
      () => true,
    ],
  },
);

if (process.env.DEBUG_DISABLE_AUTH === 'true')
{
  if (
    isLambda || 
    process.env.NODE_ENV !== 'development'
  )
  {
    throw new Error('Attempted to disable auth in production.');
  }

  const asuId = '62e0df28ba228a25b4694c5b';

  console.warn(`AUTHENTICATION DISABLED. USING asuId=${asuId}`);

  api.express().all('*', (_, res, next) => 
  {
    res.locals.unologin = { user: { asuId } };
    next();
  });
}
else 
{
  unologin.setup(
    {
      apiKey: process.env.UNOLOGIN_API_KEY,
      cookiesDomain: process.env.UNOLOGIN_COOKIES_DOMAIN,
    },
  );

  api.express().use('/login', loginEventHandler);

  // always parse login 
  api.express().all('/*', parseLogin);
}


api.add(
  {
    route: '/me/get-login-info',

    method: 'ALL',

    callback: (req, res) => res.locals.unologin.user,
  },
);

