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
  createUpdateConversationHandler,
  saveTranscriptHandler,
  getTranscriptHandler,
  cleanupConversation,
  cleanupAll,
} from './middleware';
import DLServerContext from './store/dlServerState';
import { getWebSocketPort } from './utils/socketPort';

export const mountConversationsRoutes = (dlServerState: DLServerContext): express.Router => {
  const router = express.Router();
  const { state } = dlServerState;
  const verifyBotFramework = createBotFrameworkAuthenticationMiddleware();
  const fetchConversation = createGetConversationHandler(state);

  router.post(
    '/v3/conversations',
    verifyBotFramework,
    createCreateBotEndpointHandler(state),
    createNewConversationHandler(state)
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

  router.put(
    '/conversations/:conversationId/updateConversation',
    verifyBotFramework,
    fetchConversation,
    createUpdateConversationHandler(state)
  );

  router.post('/conversations/:conversationId/saveTranscript', fetchConversation, saveTranscriptHandler(state));

  router.get('/conversations/:conversationId/transcripts', fetchConversation, getTranscriptHandler(state));

  router.put('/conversations/:conversationId/cleanup', cleanupConversation());

  router.put('/conversations/cleanupAll', fetchConversation, cleanupAll());

  return router;
};
