// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { RequestHandler } from 'express';
import jwt, { GetPublicKeyOrSecret, TokenExpiredError } from 'jsonwebtoken';
import JWKSClient, { CertSigningKey, RsaSigningKey } from 'jwks-rsa';

import { getLoginUrl, AUTH_JWKS_URL } from './config';
console.log('azure login plugin');

const BEARER_PREFIX = 'Bearer ';

const getKey: GetPublicKeyOrSecret = (header, callback) => {
  const { kid } = header;
  const jwksClient = JWKSClient({ jwksUri: AUTH_JWKS_URL });

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

const authorize: RequestHandler = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next();
    return;
  }

  // validate bearer token exists
  const authString = req.header('Authorization'); // get bearer token
  const bearer = authString && authString.startsWith(BEARER_PREFIX) && authString.substr(BEARER_PREFIX.length);
  if (!bearer || bearer.length === 0) {
    res.status(401).json({ message: 'Unauthorized', redirectUri: getLoginUrl() });
    // res.redirect(getLoginUrl());
    return;
  }

  // check token expired or not
  try {
    jwt.verify(bearer, getKey, (err, token) => {
      if (err) {
        console.error(err);
        // used by the client to display correct message
        if (err instanceof TokenExpiredError) {
          res.status(401).json({ message: 'Token expired', redirectUri: getLoginUrl() });
          // redirect renew url
          // res.redirect(getLoginUrl(true));
        } else {
          res.status(401).json({ message: 'Unauthorized', redirectUri: getLoginUrl() });
          // res.redirect(getLoginUrl());
        }
        return;
      }

      req.body = {
        ...req.body,
        decodedToken: token,
        accessToken: bearer,
      };
      next();
    });
  } catch (err) {
    next(err);
  }
};

export default async (composer: any): Promise<void> => {
  composer.addWebRoute('get', '/api/publish/subscriptions', authorize);
  composer.addWebRoute('get', '/api/publish/resourceGroups/:subscriptionId', authorize);
  // composer.addWebRoute('get', '/api/publish/resources/:subscriptionId/:resourceGroup', authorize);
  composer.addWebRoute('get', '/api/publish/:subscriptionId/locations', authorize);
  composer.addWebRoute('post', '/api/publish/:projectId/provision/:type', authorize);
};
