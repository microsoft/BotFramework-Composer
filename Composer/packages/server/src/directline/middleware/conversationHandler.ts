// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';
import { Activity } from 'botframework-schema';
import * as express from 'express';
import formatMessage from 'format-message';
import { DirectLineError } from '@bfc/shared';

import { handleDirectLineErrors } from '../utils/apiErrorException';
import { DLServerState } from '../store/dlServerState';
import { User } from '../store/types';
import { Conversation } from '../store/entities/conversation';
import { WebSocketServer } from '../utils/webSocketServer';
import { textItem } from '../utils/helpers';
import logger from '../utils/logger';
import { AttachmentContentTypes } from '../utils/constants';

export const createReplyToActivityHandler = (req: express.Request, res: express.Response): void => {
  let activityToBeSent: Activity = {
    ...req.body,
  };
  try {
    activityToBeSent.replyToId = req.params.activityId;
    const { conversation }: { conversation: Conversation } = req as any;
    activityToBeSent = conversation.prepActivityToBeSentToUser(conversation.user.id, activityToBeSent);

    if (
      activityToBeSent.attachments?.length === 1 &&
      activityToBeSent?.attachments?.[0].contentType === AttachmentContentTypes.oAuthCard
    ) {
      const oAuthException: DirectLineError = {
        message: formatMessage(
          'OAuth activities are not available for testing in Composer yet. Please continue using Bot Framework Emulator for testing OAuth actions.'
        ),
        status: StatusCodes.NOT_IMPLEMENTED,
      };
      WebSocketServer.sendToSubscribers(conversation.conversationId, activityToBeSent);
      throw oAuthException;
    }
    WebSocketServer.sendToSubscribers(conversation.conversationId, activityToBeSent);
    res.status(StatusCodes.OK).json({ id: activityToBeSent.id });
  } catch (err) {
    let exception = err;
    if (!exception.message) {
      exception = {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: formatMessage(`An error occured receiving an activity from the bot.`),
      };
    }
    handleDirectLineErrors(req, res, exception);
  }
};

export const createPostActivityHandler = (state: DLServerState): any => {
  const { logToDocument } = state.dispatchers;

  return async (req: express.Request, res: express.Response): Promise<void> => {
    const conversation: Conversation = (req as any).conversation;
    if (!conversation) {
      res.status(StatusCodes.NOT_FOUND).send('Conversation not found.').end();
      const logItem = textItem('Error', formatMessage('Cannot post activity. Conversation not found.'));
      logToDocument(req.params.conversationId, logItem);
      return;
    }

    const activity = req.body as Activity;
    try {
      const { sendActivity, status } = await conversation.postActivityToBot(state, activity);
      res.status(status).json({ id: sendActivity.id });
      WebSocketServer.sendToSubscribers(conversation.conversationId, sendActivity);
    } catch (err) {
      handleDirectLineErrors(req, res, err);
    }
  };
};

export const createUpdateConversationHandler = (state: DLServerState) => {
  return (req: express.Request, res: express.Response): void => {
    const oldConversationId = req.params.conversationId;
    try {
      const { conversationId, userId, locale } = req.body;
      const currentConversation = state.conversations.conversationById(oldConversationId);
      if (!oldConversationId || !currentConversation) {
        res.status(StatusCodes.NOT_FOUND).send(formatMessage('Conversation ID cannot be updated.'));
      }
      // update the conversation object and reset as much as we can to resemble a new conversation
      state.conversations.deleteConversation(oldConversationId);

      currentConversation.conversationId = conversationId;
      currentConversation.user.id = userId;
      if (locale && currentConversation.locale !== locale) {
        currentConversation.locale = locale;
      }

      const user: User | undefined = currentConversation.members.find((member) => member.name === 'User');
      if (!user) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(formatMessage(`Conversation ${oldConversationId} is missing the user in the members array.`));
      }

      if (user) {
        user.id = userId;
      }

      currentConversation.clearConversation();
      currentConversation.nextWatermark = 0;
      state.dispatchers.updateConversation(conversationId, currentConversation);

      res.status(StatusCodes.CREATED).json({
        botEndpoint: currentConversation.botEndpoint,
        conversationId: currentConversation.conversationId,
        user: currentConversation.user,
        mode: currentConversation.chatMode,
        members: currentConversation.members,
        nextWatermark: currentConversation.nextWatermark,
      });
    } catch (err) {
      logger(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(formatMessage(`An error occured updating the conversation id ${oldConversationId}`));
    }
  };
};
