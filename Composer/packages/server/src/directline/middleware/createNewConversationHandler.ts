// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';
import * as express from 'express';

import { DLServerState } from '../store/dlServerState';
import { validateRequest } from '../utils/helpers';
import { BotEndpoint } from '../store/entities/botEndpoint';

export const createNewConversationHandler = (state: DLServerState) => {
  return (req: express.Request, res: express.Response): void => {
    const validationResult = validateRequest({
      ...req.body,
      botEndpoint: (req as any).botEndpoint,
    });

    if (validationResult) {
      res.status(StatusCodes.BAD_REQUEST).send(validationResult).end();
      return;
    }

    const { members, mode, locale } = req.body;
    const { botEndpoint }: { botEndpoint: BotEndpoint } = req as any;
    const { conversations } = state;

    const conversation = conversations.newConversation(botEndpoint, members[0], mode, locale);

    state.endpoints.set(conversation.botEndpoint.id, conversation.botEndpoint);
    res.status(StatusCodes.CREATED).json({
      conversationId: conversation.conversationId,
      endpointId: botEndpoint.id,
      members: conversation.members,
      id: conversation.conversationId,
    });
  };
};
