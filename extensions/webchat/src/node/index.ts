// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import toNumber from 'lodash/toNumber';
import { IExtensionRegistration } from '@botframework-composer/types';
import { Request, Response, NextFunction } from 'express';

import { mountConversationsRoutes } from './directline/mountConversationRoutes';
import { mountDirectLineRoutes } from './directline/mountDirectlineRoutes';
import DLServerContext from './directline/store/DLServerState';

const addCORSHeaders = (req: Request, res: Response, next?: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-ms-bot-agent'
  );
  next?.();
};

function initialize(registration: IExtensionRegistration) {
  const preferredPort = toNumber(process.env.PORT) || 5000;
  const DLServerState = DLServerContext.getInstance(preferredPort);

  const conversationRouter = mountConversationsRoutes(DLServerState);
  const directlineRouter = mountDirectLineRoutes(DLServerState);

  conversationRouter.use((req, res, next) => addCORSHeaders(req, res, next));
  directlineRouter.use((req, res, next) => addCORSHeaders(req, res, next));

  registration.addRouter('/', conversationRouter);
  registration.addRouter('/', directlineRouter);
}

module.exports = {
  initialize,
};
