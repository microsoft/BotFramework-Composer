// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authentication, usGovernmentAuthentication, v31Authentication, v32Authentication } from '../utils/constants';
import { OpenIdMetadata } from '../utils/openIdMetaData';

export const createBotFrameworkAuthenticationMiddleware = () => {
  const openIdMetadata = new OpenIdMetadata(authentication.openIdMetadata);
  const usGovOpenIdMetadata = new OpenIdMetadata(usGovernmentAuthentication.openIdMetadata);

  return async (req: express.Request, res: express.Response, next?: express.NextFunction) => {
    const authorization = req.get('Authorization');

    if (!authorization) {
      next?.();
      return;
    }

    const [authMethod, token] = authorization.trim().split(' ');
    const decoded: any = /^bearer$/i.test(authMethod) && token && jwt.decode(token, { complete: true });

    if (!decoded) {
      res.status(StatusCodes.UNAUTHORIZED).end();
      return;
    }

    if (decoded.payload.aud === usGovernmentAuthentication.botTokenAudience) {
      // We are talking to a US Gov hosted bot so do validation with that context
      const key = await usGovOpenIdMetadata.getKey(decoded.header.kid);
      let issuer: string;

      if (decoded.payload.ver === '1.0') {
        issuer = usGovernmentAuthentication.tokenIssuerV1;
      } else if (decoded.payload.ver === '2.0') {
        issuer = usGovernmentAuthentication.tokenIssuerV2;
      } else {
        res.status(401).end();
        return;
      }

      try {
        (req as any).jwt = jwt.verify(token, key ?? '', {
          audience: usGovernmentAuthentication.botTokenAudience,
          clockTolerance: 300,
          issuer,
        });
      } catch (err) {
        res.status(StatusCodes.UNAUTHORIZED).end();
        return;
      }
    } else {
      const key = await openIdMetadata.getKey(decoded.header.kid);

      if (!key) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
        return;
      }

      let issuer: string;
      if (decoded.payload.ver === '1.0') {
        issuer = v32Authentication.tokenIssuerV1;
      } else if (decoded.payload.ver === '2.0') {
        issuer = v32Authentication.tokenIssuerV2;
      } else {
        res.status(StatusCodes.UNAUTHORIZED).end();
        return;
      }

      try {
        (req as any).jwt = jwt.verify(token, key, {
          audience: authentication.botTokenAudience,
          clockTolerance: 300,
          issuer,
        });
      } catch (err) {
        try {
          (req as any).jwt = jwt.verify(token, key, {
            audience: authentication.botTokenAudience,
            clockTolerance: 300,
            issuer: v31Authentication.tokenIssuer,
          });
        } catch (err) {
          res.status(StatusCodes.UNAUTHORIZED).end();
          return;
        }
      }
    }
    next?.();
  };
};
