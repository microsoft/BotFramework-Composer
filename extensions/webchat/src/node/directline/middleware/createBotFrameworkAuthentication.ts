// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authentication, usGovernmentAuthentication, v31Authentication, v32Authentication } from '../utils/constants';
import { OpenIdMetadata } from '../utils/openIdMetaData';

export function createBotFrameworkAuthenticationMiddleware() {
  const openIdMetadata = new OpenIdMetadata(authentication.openIdMetadata);
  const usGovOpenIdMetadata = new OpenIdMetadata(usGovernmentAuthentication.openIdMetadata);

  return async (req: express.Request, res: express.Response, next) => {
    const authorization = req.get('Authorization');

    if (!authorization) {
      next();
      return;
    }

    const [authMethod, token] = authorization.trim().split(' ');

    // Verify token
    const decoded: any = /^bearer$/i.test(authMethod) && token && jwt.decode(token, { complete: true });

    if (!decoded) {
      // Token not provided so
      res.status(StatusCodes.UNAUTHORIZED);
      res.end();

      return;
    }

    if (decoded.payload.aud === usGovernmentAuthentication.botTokenAudience) {
      // We are talking to a US Gov hosted bot so do validation with that context
      const key = await usGovOpenIdMetadata.getKey(decoded.header.kid);

      let issuer;

      if (decoded.payload.ver === '1.0') {
        issuer = usGovernmentAuthentication.tokenIssuerV1;
      } else if (decoded.payload.ver === '2.0') {
        issuer = usGovernmentAuthentication.tokenIssuerV2;
      } else {
        // unknown token format
        res.status(401);
        res.end();

        return;
      }

      try {
        (req as any).jwt = jwt.verify(token, key, {
          audience: usGovernmentAuthentication.botTokenAudience,
          clockTolerance: 300,
          issuer,

          // TODO: "jwtId" is a typo, it should be "jwtid"
          //       But when we enable "jwtid", it will fail the verification
          //       because the payload does not specify "jti"
          //       When we comment out "jwtId", it also works (because it is a typo)

          // jwtId: botId
        });
      } catch (err) {
        res.status(StatusCodes.UNAUTHORIZED);
        res.end();

        return;
      }
    } else {
      // We are talking to a Public Azure host bot so do public Azure verification steps
      const key = await openIdMetadata.getKey(decoded.header.kid);

      if (!key) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        res.end();

        return;
      }

      let issuer;

      if (decoded.payload.ver === '1.0') {
        issuer = v32Authentication.tokenIssuerV1;
      } else if (decoded.payload.ver === '2.0') {
        issuer = v32Authentication.tokenIssuerV2;
      } else {
        // unknown token format
        res.status(StatusCodes.UNAUTHORIZED);
        res.end();

        return;
      }

      try {
        // TODO: Turn jwt.verify into async call for better performance
        // first try 3.2 token characteristics
        (req as any).jwt = jwt.verify(token, key, {
          audience: authentication.botTokenAudience,
          clockTolerance: 300,
          issuer,

          // TODO: "jwtId" is a typo, it should be "jwtid"
          //       But when we enable "jwtid", it will fail the verification
          //       because the payload does not specify "jti"
          //       When we comment out "jwtId", it also works (because it is a typo)

          // jwtId: botId
        });
      } catch (err) {
        try {
          // then try v3.1 token characteristics
          (req as any).jwt = jwt.verify(token, key, {
            audience: authentication.botTokenAudience,
            clockTolerance: 300,
            issuer: v31Authentication.tokenIssuer,

            // TODO: "jwtId" is a typo, it should be "jwtid"
            //       But when we enable "jwtid", it will fail the verification
            //       because the payload does not specify "jti"
            //       When we comment out "jwtId", it also works (because it is a typo)

            // jwtId: botId
          });
        } catch (err) {
          res.status(StatusCodes.UNAUTHORIZED);
          res.end();

          return;
        }
      }
    }
    next();
  };
}
