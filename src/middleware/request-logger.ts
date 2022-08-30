
import express from 'express';

const router = express.Router();

export default router;

router.all('*', (req, res, next) => 
{
  console.log(`BEGIN REQUEST ${req.method} ${req.url}`);

  console.log(req.body);

  console.log('#######');

  next();
});

