/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import querystring from 'querystring';

import jwt, { GetPublicKeyOrSecret, TokenExpiredError } from 'jsonwebtoken';
import JWKSClient, { CertSigningKey, RsaSigningKey } from 'jwks-rsa';
import { RequestHandler } from 'express';

import { BASEURL } from '../constants';

import { AuthProviderInit } from './types';
const BEARER_PREFIX = 'Bearer ';
const LOGIN_URL = 'https://login.microsoftonline.com/common/oauth2/authorize';

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: Record<string, any>;
    }
  }
}

interface BFTokenPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
  tid: string;
  oid: string;
  serviceurl: string;
  nbf: number;
  exp: number;
  iss: string;
  aud: string;
}

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
    const {
      COMPOSER_AUTH_PROVIDER,
      COMPOSER_BOT_ID,
      COMPOSER_AUTH_CLIENT_ID,
      COMPOSER_AUTH_REDIRECT_URI,
      COMPOSER_AUTH_JWKS_URL,
      COMPOSER_AUTH_RESOURCE,
      MicrosoftAppId,
    } = process.env;

    // validate required config settings
    const botId = validateConfig('COMPOSER_BOT_ID', COMPOSER_BOT_ID);
    const clientId = validateConfig('COMPOSER_AUTH_CLIENT_ID', COMPOSER_AUTH_CLIENT_ID);
    const redirectUri = validateConfig('COMPOSER_AUTH_REDIRECT_URI', COMPOSER_AUTH_REDIRECT_URI);
    const jwksUri = validateConfig('COMPOSER_AUTH_JWKS_URL', COMPOSER_AUTH_JWKS_URL);
    const resource = validateConfig('COMPOSER_AUTH_RESOURCE', COMPOSER_AUTH_RESOURCE);
    const msAppId = validateConfig('MicrosoftAppId', MicrosoftAppId);

    const jwksClient = JWKSClient({ jwksUri });

    const getKey: GetPublicKeyOrSecret = (header, callback) => {
      const { kid } = header;

      if (!kid || kid.length === 0) {
        callback('kid missing');
        return;
      }

      jwksClient.getSigningKey(kid, (err, key) => {
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
        jwt.verify(bearer, getKey, (err, token) => {
          if (err) {
            console.error(err);

            // used by the client to display correct message
            if (err instanceof TokenExpiredError) {
              res.status(401).json({ message: 'Session expired' });
            } else {
              res.status(401).json({ message: 'Unauthorized' });
            }
            return;
          }
          // make sure token.aud is authorized for this bot
          if (typeof token !== 'object' || (token as BFTokenPayload).aud !== msAppId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
          }

          req.user = {
            decodedToken: token,
            accessToken: bearer,
          };
          next();
        });
      } catch (err) {
        next(err);
      }
    };

    const login: RequestHandler = (req, res) => {
      /* eslint-disable @typescript-eslint/camelcase */
      const query = querystring.stringify({
        response_type: 'token',
        response_mode: 'form_post',
        client_id: clientId,
        resource,
        redirect_uri: redirectUri,
        state: querystring.stringify({
          botId,
          resource: req.query.resource || `${BASEURL}/home`,
        }),
      });
      /* eslint-enable @typescript-eslint/camelcase */

      res.redirect(`${LOGIN_URL}?${query}`);
    };

    return {
      login,
      authorize,
    };
  },
};

export default absh;
