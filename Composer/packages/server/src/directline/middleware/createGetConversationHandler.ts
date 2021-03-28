// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';
import * as express from 'express';
import formatMessage from 'format-message';
import { DirectLineError } from '@botframework-composer/types';

import { BotErrorCodes } from '../utils/apiErrorException';
import { DLServerState } from '../store/dlServerState';
import { ConversationAPIPathParameters } from '../store/types';

export const createGetConversationHandler = (state: DLServerState) => {
  return (req: express.Request, res: express.Response, next?: express.NextFunction): any => {
    const conversationParameters: ConversationAPIPathParameters = req.params;
    const conversation = state.conversations.conversationById(conversationParameters.conversationId);

    if (!conversation) {
      const err: DirectLineError = {
        status: StatusCodes.NOT_FOUND,
        message: formatMessage(`Conversation not found. ${BotErrorCodes.BadArgument}`),
      };
      throw err;
    }
    (req as any).conversation = conversation;
    next?.();
  };
};
