import { URL } from 'url';
import querystring from 'querystring';

import jwt, { GetPublicKeyOrSecret } from 'jsonwebtoken';
import JWKSClient, { CertSigningKey, RsaSigningKey } from 'jwks-rsa';
import { RequestHandler } from 'express';

import { BASEURL } from '../constants';

import { AuthProviderInit } from './types';
const BEARER_PREFIX = 'Bearer ';

class AuthProviderConfigurationError extends Error {
  constructor(name: string) {
    super(`Missing auth provider configutation for: ${name}`);

    Error.captureStackTrace(this, AuthProviderConfigurationError);
  }
}

function validateConfig(name: string, configValue?: string): string {
  if (!configValue || configValue.length === 0) {
    throw new AuthProviderConfigurationError(name);
  }

  return configValue;
}

const absh: AuthProviderInit = {
  initialize: () => {
    const { COMPOSER_AUTH_PROVIDER, COMPOSER_BOT_ID, COMPOSER_AUTH_LOGIN_URL, COMPOSER_AUTH_JWKS_URL } = process.env;

    // validate required config settings
    const botId = validateConfig('COMPOSER_BOT_ID', COMPOSER_BOT_ID);
    const loginUrl = validateConfig('COMPOSER_AUTH_LOGIN_URL', COMPOSER_AUTH_LOGIN_URL);
    const jwksUri = validateConfig('COMPOSER_AUTH_JWKS_URL', COMPOSER_AUTH_JWKS_URL);

    const client = JWKSClient({ jwksUri });

    const getKey: GetPublicKeyOrSecret = (header, callback) => {
      const { kid } = header;

      if (!kid || kid.length === 0) {
        callback('kid missing');
        return;
      }

      client.getSigningKey(kid, (err, key) => {
        if (err) {
          callback(err);
          return;
        }

        if (!key) {
          callback('no key');
          return;
        }

        callback(null, (key as CertSigningKey).publicKey || (key as RsaSigningKey).rsaPublicKey);
      });
    };

    const authorize: RequestHandler = (req, res, next) => {
      if (COMPOSER_AUTH_PROVIDER !== 'abs-h' || req.method === 'OPTIONS') {
        next();
        return;
      }

      // validate bearer token exists
      const authHeader = req.header('Authorization');
      const bearer = authHeader && authHeader.startsWith(BEARER_PREFIX) && authHeader.substr(BEARER_PREFIX.length);

      if (!bearer || bearer.length === 0) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      try {
        jwt.verify(bearer, getKey, (err, _token) => {
          if (err) {
            console.error(err);
            res.status(401).json({ error: 'Unauthorized' });
            return;
          }
          next();
        });
      } catch (err) {
        next(err);
      }
    };

    const login: RequestHandler = (req, res) => {
      const redirectUrl = new URL(loginUrl);

      if (!redirectUrl) {
        res.redirect(`${BASEURL}/`);
        return;
      }

      redirectUrl.searchParams.set(
        'state',
        querystring.stringify({
          botId,
          resource: req.query.resource || `${BASEURL}/home`,
        })
      );

      res.redirect(redirectUrl.toString());
    };

    return {
      login,
      authorize,
    };
  },
};

export default absh;
