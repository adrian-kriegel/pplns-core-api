
import * as unologin from '@unologin/node-api';

import { Errors, LemurRouter } from 'express-lemur';

const {
  parseLogin,
  loginEventHandler,
  onAuthError,
  logoutHandler,
} = unologin.express;

unologin.setup(
  {
    apiKey: process.env.UNOLOGIN_API_KEY,
    cookiesDomain: process.env.UNOLOGIN_COOKIES_DOMAIN,
  },
);

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

api.express().use('/login', loginEventHandler);

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

// always parse login 
api.express().all('/*', parseLogin);
