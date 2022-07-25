
/**
 * Mock agent implementation for unologin.
 * Exports superagent-like agent as default.
 */

import express, { Router } from 'express';

import { LemurRouter } from 'express-lemur';
 
import { mock, supermock } from 'express-supermock';
  
import { User } from '@unologin/node-api';
  
import jwt from 'jsonwebtoken';
  
const tokenSecret = 'abc123';
/**
   * @returns test token
   * @param user user
   */
export function signLoginToken(user: Omit<User, 'iat'>)
{
  return jwt.sign(user, tokenSecret);
}
  
const router = Router();
  
mock(process.env.UNOLOGIN_API || 'v1.unolog.in', { router });
  
mock(
  new URL(process.env.UNOLOGIN_LEGACY_API || 'https://api.unolog.in').hostname,
  { router },
);
  
router.use(express.json());
  
router.post('/users/auth', (req, res) => 
{
  res.send(
    jwt.verify(req.body.user.appLoginToken, tokenSecret),
  );
});
  
router.get('/public-keys/app-login-token', (req, res) => 
{
  res.send(
    {
      data: tokenSecret,
    },
  );
});
  
LemurRouter.setOptions(
  'unologin-mock-legacy',
  LemurRouter.defaultOptions,
);
  
  
export default supermock;
  
 
