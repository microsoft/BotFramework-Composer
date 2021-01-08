// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NextFunction, Request, Response } from 'express';

import { authService } from '../services/auth/auth';

/**
 * Middleware that verifies if the server-generated CSRF token is sent with the incoming request via header.
 */
export const csrfProtection = (req: Request, res: Response, next?: NextFunction) => {
  // the CSRF token will only be generated in the production environment
  if (authService.csrfToken) {
    const csrfToken = req.get('X-CSRF-Token');
    if (!csrfToken) {
      // do not complete the request, the client did not provide the server-generated token
      return res.status(403).send({ message: 'CSRF token required.' });
    }
    if (csrfToken !== authService.csrfToken) {
      // do not complete the request, the client provided a token that did not match the server-generated token
      return res.status(403).send({ message: `CSRF token did not match server's token.` });
    }
  }

  // check passed, continue to next handler
  next && next();
};
