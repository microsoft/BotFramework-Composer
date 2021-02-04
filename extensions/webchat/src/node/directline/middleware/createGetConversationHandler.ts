// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';
import * as express from 'express';

import { BotErrorCodes, createAPIException } from '../utils/apiErrorException';
import { DLServerState } from '../store/DLServerState';
import { ConversationAPIPathParameters } from '../store/types';

export function createGetConversationHandler(state: DLServerState) {
  return (req: express.Request, res: express.Response, next?: express.NextFunction): any => {
    const conversationParameters: ConversationAPIPathParameters = req.params;
    const conversation = state.conversations.conversationById(conversationParameters.conversationId);

    if (!conversation) {
      throw createAPIException(StatusCodes.NOT_FOUND, BotErrorCodes.BadArgument, 'conversation not found');
    }
    (req as any).conversation = conversation;
    next?.();
  };
}
