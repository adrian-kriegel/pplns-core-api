
import './env-setup';

import app from './app';

const port = process.env.SERVER_PORT || 1337;

app.listen(port, () => 
{
  console.log('Server listening on port ' + port);
});
