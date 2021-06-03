// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';

import { logNetworkTraffic } from '../middleware/logNetworkTraffic';

import {
  createGetConversationHandler,
  createGetEndpointHandler,
  createPostActivityHandler,
  createUploadHandler,
} from './middleware';
import DLServerContext from './store/dlServerState';

export const mountDirectLineRoutes = (dLServerContext: DLServerContext): express.Router => {
  const router = express.Router();
  const { state } = dLServerContext;
  const getBotEndpoint = createGetEndpointHandler(state);
  const getConversation = createGetConversationHandler(state);

  router.options('/v3/directline', (req: express.Request, res: express.Response) => {
    res.send(StatusCodes.OK);
    res.end();
  });

  router.post(
    '/v3/directline/conversations/:conversationId/activities',
    logNetworkTraffic,
    getBotEndpoint,
    getConversation,
    createPostActivityHandler(state)
  );

  router.post(
    '/v3/directline/conversations/:conversationId/upload',
    logNetworkTraffic,
    getBotEndpoint,
    getConversation,
    createUploadHandler(state)
  );

  return router;
};
