// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
//

import * as express from 'express';

import {
  createBotFrameworkAuthenticationMiddleware,
  createCreateBotEndpointHandler,
  createGetConversationHandler,
  createNewConversationHandler,
  createReplyToActivityHandler,
  createUploadAttachmentHandler,
  sendActivityToConversation,
  createUpdateConversationHandler,
} from './middleware';
import DLServerContext from './store/DLServerState';
import { getWebSocketPort } from './utils/socketPort';

export function mountConversationsRoutes(dLServerState: DLServerContext) {
  const router = express.Router();
  const { state } = dLServerState;
  const verifyBotFramework = createBotFrameworkAuthenticationMiddleware();
  const fetchConversation = createGetConversationHandler(state);

  router.post(
    '/v3/conversations',
    verifyBotFramework,
    createCreateBotEndpointHandler(state),
    createNewConversationHandler(state)
  );

  router.post(
    '/v3/conversations/:conversationId/activities',
    verifyBotFramework,
    fetchConversation,
    sendActivityToConversation
  );

  router.post(
    '/v3/conversations/:conversationId/activities/:activityId',
    verifyBotFramework,
    fetchConversation,
    createReplyToActivityHandler
  );

  router.post(
    '/v3/conversations/:conversationId/attachments',
    verifyBotFramework,
    createUploadAttachmentHandler(state)
  );

  router.get('/conversations/ws/port', getWebSocketPort);

  // The initial greeting from the bot
  router.put(
    '/conversations/:conversationId/updateConversation',
    verifyBotFramework,
    fetchConversation,
    createUpdateConversationHandler(state)
  );

  return router;
}
