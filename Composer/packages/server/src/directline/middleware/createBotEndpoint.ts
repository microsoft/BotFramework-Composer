// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as express from 'express';

import { BotEndpoint } from '../store/entities/botEndpoint';
import { DLServerState } from '../store/dlServerState';

export const createCreateBotEndpointHandler = (state: DLServerState) => {
  return (req: express.Request, res: express.Response, next?: express.NextFunction): void => {
    const request = req as any;
    const { endpoints } = state;

    const { bot, botUrl, msaAppId, msaPassword } = req.body;
    let endpoint = endpoints.get(botUrl);
    if (!endpoint) {
      endpoint = endpoints.set(bot.id, new BotEndpoint(bot.id, bot.id, botUrl, msaAppId, msaPassword));
    } else {
      endpoint.msaAppId = msaAppId;
      endpoint.msaPassword = msaPassword;
    }
    request.botEndpoint = endpoint;
    next?.();
  };
};

export const createGetEndpointHandler = (state: DLServerState) => {
  return (req: express.Request, res: express.Response, next?: express.NextFunction): any => {
    const auth = req.header('Authorization');
    const { endpoints } = state;
    const tokenMatch = /Bearer\s+(.+)/.exec(auth) || [];
    (req as any).botEndpoint = endpoints.get(tokenMatch[1]) || state.dispatchers.getDefaultEndpoint();
    next?.();
  };
};
