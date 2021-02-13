// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as express from 'express';

import { createGetAttachmentHandler, createGetAttachmentInfoHandler } from './middleware/attachmentHandler';
import DLServerContext from './store/dlServerState';

export const mountAttachmentRoutes = (dlServerState: DLServerContext): express.Router => {
  const router = express.Router();
  const { state } = dlServerState;

  router.get('/v3/attachments/:attachmentId', createGetAttachmentInfoHandler(state));

  router.get('/v3/attachments/:attachmentId/views/:viewId', createGetAttachmentHandler(state));
  return router;
};
