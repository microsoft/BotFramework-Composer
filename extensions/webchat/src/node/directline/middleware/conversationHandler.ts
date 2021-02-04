// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';
import { Activity } from 'botframework-schema';
import * as express from 'express';

import { sendErrorResponse } from '../utils/apiErrorException';
import { DLServerState } from '../store/DLServerState';
import { User } from '../store/types';
import { Conversation } from '../store/entities/Conversation';
import { WebSocketServer } from '../utils/WebSocketServer';
import { textItem } from '../utils/helpers';

export function createReplyToActivityHandler(req: express.Request, res: express.Response): void {
  let activity = req.body as Activity;
  const activityToBeSent = {
    ...activity,
  };
  try {
    activityToBeSent.replyToId = req.params.activityId;
    const { conversation }: { conversation: Conversation } = req as any;
    activity = conversation.prepActivityToBeSentToUser(conversation.user.id, activityToBeSent);
    WebSocketServer.sendToSubscribers(conversation.conversationId, activityToBeSent);
    res.status(StatusCodes.OK).json({ id: activityToBeSent.id });
  } catch (err) {
    sendErrorResponse(req, res, err);
  }
}

export function createPostActivityHandler(state: DLServerState): any {
  const { logToDocument } = state.dispatchers;

  return async (req: express.Request, res: express.Response): Promise<void> => {
    const conversation: Conversation = (req as any).conversation;
    if (!conversation) {
      res.status(StatusCodes.NOT_FOUND).send('conversation not found').end();
      const logItem = textItem('Error', 'Cannot post activity. Conversation not found.');
      logToDocument(req.params.conversationId, logItem);
      return;
    }

    const activity = req.body as Activity;
    try {
      const { updatedActivity, status } = await conversation.postActivityToBot(state, activity);
      res.status(status).json({ id: updatedActivity?.id });
      WebSocketServer.sendToSubscribers(conversation.conversationId, activity);
    } catch (err) {
      const errObj = err.response;
      sendErrorResponse(req, res, errObj);
    }
  };
}

export function createUpdateConversationHandler(state: DLServerState) {
  return (req: express.Request, res: express.Response): void => {
    const oldConversationId = req.params.conversationId;
    const { conversationId, userId } = req.body;
    const currentConversation = state.conversations.conversationById(oldConversationId);
    if (!oldConversationId || !currentConversation) {
      res.status(StatusCodes.NOT_FOUND).send('Conversation ID cannot be updated.');
    }

    // update the conversation object and reset as much as we can to resemble a new conversation
    state.conversations.deleteConversation(oldConversationId);

    currentConversation.conversationId = conversationId;
    currentConversation.user.id = userId;
    const user: User | undefined = currentConversation.members.find((member) => member.name === 'User');
    if (!user) {
      const err = new Error(`Conversation ${oldConversationId} is missing the user in the members array.`);
      res.status(StatusCodes.BAD_REQUEST).json(err);
    }

    if (user) {
      user.id = userId;
    }

    currentConversation.clearConversation();
    currentConversation.nextWatermark = 0;
    state.dispatchers.updateConversation(conversationId, currentConversation);

    res.status(StatusCodes.OK).json({
      botEndpoint: currentConversation.botEndpoint,
      conversationId: currentConversation.conversationId,
      user: currentConversation.user,
      mode: currentConversation.chatMode,
      members: currentConversation.members,
      nextWatermark: currentConversation.nextWatermark,
    });
  };
}
