// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';
import { Activity, AttachmentData, ConversationMembers, Attachment } from 'botframework-schema';
import * as express from 'express';
import * as Formidable from 'formidable';

import { BotErrorCodes, createAPIException, sendErrorResponse } from '../utils/apiErrorException';
import { DLServerState } from '../store/DLServerState';
import { ConversationAPIPathParameters, User } from '../store/types';
import { BotEndpoint } from '../utils/botEndpoint';
import { Conversation } from '../store/entities/Conversation';
import { WebSocketServer } from '../utils/websocketServer';
import { textItem, statusCodeFamily } from '../utils/helpers';
import { writeFile, mkdirp, readFile } from '../utils/fileOperations';

function validateRequest(payload): Error | undefined {
  if (!payload.bot) {
    return new Error('Missing bot object in request.');
  } else if (!payload.botEndpoint) {
    return new Error('Missing botEndpoint object in request.');
  } else if (payload.members.length !== 1 || payload.members[0].role !== 'user') {
    return new Error('Missing user inside of members array in request.');
  }
}

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

export function createNewConversationHandler(state: DLServerState) {
  return (req: express.Request, res: express.Response): void => {
    const validationResult = validateRequest({
      ...req.body,
      botEndpoint: (req as any).botEndpoint,
    });
    if (validationResult) {
      res.send(StatusCodes.BAD_REQUEST, validationResult);
      res.end();
    }

    const { members, mode } = req.body;
    const { botEndpoint }: { botEndpoint: BotEndpoint } = req as any;
    const { conversations } = state;

    const conversation = conversations.newConversation(botEndpoint, members[0], mode);
    res.status(StatusCodes.CREATED).json({
      conversationId: conversation.conversationId,
      endpointId: botEndpoint.id,
      members: conversation.members,
      id: conversation.conversationId,
    });
  };
}

export function sendActivityToConversation(req: express.Request, res: express.Response): any {
  let activity = req.body as Activity;
  try {
    activity.id = undefined;
    activity.replyToId = req.params.activityId;
    const { conversation }: { conversation: Conversation } = req as any;

    activity = conversation.prepActivityToBeSentToUser(conversation.user.id, activity);
    WebSocketServer.sendToSubscribers(conversation.conversationId, activity);
    res.status(StatusCodes.OK).json({ id: activity.id });
  } catch (err) {
    sendErrorResponse(req, res, err);
  }
}

export function createReplyToActivityHandler(req: express.Request, res: express.Response): void {
  let activity = req.body as Activity;
  try {
    activity.id = undefined;
    activity.replyToId = req.params.activityId;
    const { conversation }: { conversation: Conversation } = req as any;

    activity = conversation.prepActivityToBeSentToUser(conversation.user.id, activity);
    WebSocketServer.sendToSubscribers(conversation.conversationId, activity);
    res.status(StatusCodes.OK).json({ id: activity.id });
  } catch (err) {
    sendErrorResponse(req, res, err);
  }
}

export function createUploadAttachmentHandler(state: DLServerState) {
  return (req: express.Request, res: express.Response): void => {
    const attachmentData = req.body as AttachmentData;

    try {
      const resourceId = state.attachments.uploadAttachment(attachmentData);
      const resourceResponse = { id: resourceId };
      res.status(StatusCodes.OK).json(resourceResponse);
    } catch (err) {
      sendErrorResponse(req, res, err);
    }
  };
}

export function createGetConversationsHandler(state: DLServerState) {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const conversationParameters = req.params as any;
    const { continuationToken } = conversationParameters;
    const { conversations: api } = state;
    const conversations = api.getConversations();
    const response = {
      conversations: [] as ConversationMembers[],
    };

    if (continuationToken) {
      let tokenFound = false;
      response.conversations = conversations.reduce(
        (continued: ConversationMembers[], convo: Conversation): ConversationMembers[] => {
          tokenFound = tokenFound || convo.conversationId === continuationToken;
          if (tokenFound) {
            continued.push({ id: convo.conversationId, members: convo.members });
          }
          return continued;
        },
        []
      );
    } else {
      response.conversations = conversations.map((convo) => ({ id: convo.conversationId, members: convo.members }));
    }
    try {
      res.status(StatusCodes.OK).json(response);
    } catch (err) {
      sendErrorResponse(req, res, err);
    }
    next();
  };
}

export function createPostActivityHandler(state: DLServerState): any {
  const { logToDocument } = state.dispatchers;

  return async (req: express.Request, res: express.Response): Promise<void> => {
    const conversation: Conversation = (req as any).conversation;

    if (!conversation) {
      res.send(StatusCodes.NOT_FOUND, 'conversation not found');
      res.end();

      const logItem = textItem('Error', 'Cannot post activity. Conversation not found.');

      logToDocument(req.params.conversationId, logItem);
      return;
    }

    let activity = req.body as Activity;

    try {
      const { updatedActivity, response, statusCode } = await conversation.postActivityToBot(state, activity);

      if (!statusCodeFamily(statusCode, 200) || !updatedActivity) {
        if (statusCode === StatusCodes.UNAUTHORIZED || statusCode === StatusCodes.FORBIDDEN) {
          const logItem = textItem('Error', 'Cannot post activity. Unauthorized.');
          logToDocument(req.params.conversationId, logItem);
        }

        if (statusCode === StatusCodes.NOT_FOUND) {
          const logItem = textItem(
            'Error',
            `This conversation does not have an endpoint, cannot post "${activity?.type}" activity.`
          );
          logToDocument(req.params.conversationId, logItem);
        }

        let err;
        if (response.text) {
          err = await response.text();
        } else {
          err = {
            message: response.message,
            status: response.status,
          };
        }
        res.send(statusCode || StatusCodes.INTERNAL_SERVER_ERROR, err);
      } else {
        activity = updatedActivity;
        res.status(statusCode).json({ id: activity.id });
        WebSocketServer.sendToSubscribers(conversation.conversationId, activity);
      }
    } catch (err) {
      sendErrorResponse(req, res, err);
    }
  };
}

export function createUploadHandler(state: DLServerState) {
  return async (req: express.Request, res: express.Response): Promise<void> => {
    const conversation: Conversation = (req as any).conversation;
    if (!conversation) {
      res.status(StatusCodes.NOT_FOUND).send('conversation not found');
      const logItem = textItem('Error', 'Cannot upload file. Conversation not found.');
      state.dispatchers.logToDocument(req.params.conversationId, logItem);
      return;
    }

    // TODO: Check if request is chunked when contnt length is 0
    if (!req.is('multipart/form-data') || Number(req.headers['content-length']) === 0) {
      res.status(StatusCodes.BAD_REQUEST).send('Cannot parse attachment.');
      return;
    }

    const form = new Formidable.IncomingForm();

    form.multiples = true;
    form.keepExtensions = true;
    // TODO: Override form.onPart handler so it doesn't write temp files to disk.
    form.parse(req as any, async (err, fields, files: any) => {
      try {
        const activity = JSON.parse((files.activity.path, 'utf8'));
        let uploads = files.file;

        if (!Array.isArray(uploads)) {
          uploads = [uploads];
        }
        if (uploads?.length) {
          activity.attachments = [];
          for (const upload1 of uploads) {
            const name = (upload1 as any).name || 'file.dat';
            const type = upload1.type;
            const path = upload1.path;
            const base64EncodedContent = await readFile(path, 'base64');
            const base64Buf = Buffer.from(base64EncodedContent, 'base64');
            const attachmentData: AttachmentData = {
              type,
              name,
              originalBase64: new Uint8Array(base64Buf),
              thumbnailBase64: new Uint8Array(base64Buf),
            };
            const attachmentId = state.attachments.uploadAttachment(attachmentData);
            const attachment: Attachment = {
              name,
              contentType: type,
              contentUrl: `${state.serviceUrl}/v3/attachments/${attachmentId}/views/original`,
            };

            activity.attachments.push(attachment);
          }

          try {
            const { updatedActivity, statusCode, response } = await conversation.postActivityToBot(state, activity);

            if (!statusCodeFamily(statusCode, 200)) {
              res.send(statusCode || StatusCodes.INTERNAL_SERVER_ERROR, await response.text());
              res.end();
            } else {
              res.send(statusCode, { id: updatedActivity?.id });
              res.end();
            }
          } catch (err) {
            sendErrorResponse(req, res, err);
          }
        } else {
          res.status(StatusCodes.BAD_REQUEST).send('no file uploaded');
        }
      } catch (err) {
        sendErrorResponse(req, res, err);
      }
    });
  };
}

export function createUpdateConversationHandler(state: DLServerState) {
  return (req: express.Request, res: express.Response): void => {
    const currentConversationId = req.params.conversationId;
    const { conversationId, userId } = req.body;
    const currentConversation = state.conversations.conversationById(currentConversationId);
    if (!currentConversationId) {
      res.send(StatusCodes.NOT_FOUND);
    }

    // update the conversation object and reset as much as we can to resemble a new conversation
    state.conversations.deleteConversation(currentConversationId);
    currentConversation.conversationId = conversationId;
    currentConversation.user.id = userId;
    const user: User | undefined = currentConversation.members.find((member) => member.name === 'User');
    if (!user) {
      const err = new Error(`Conversation ${currentConversationId} is missing the user in the members array.`);
      res.status(StatusCodes.BAD_REQUEST).json(err);
    }

    if (user) {
      user.id = userId;
    }

    currentConversation.clearConversation();
    currentConversation.nextWatermark = 0;
    state.conversations.conversations[conversationId] = currentConversation;

    res.status(StatusCodes.OK).json({
      // can't return the conversation object because event emitters are circular JSON
      botEndpoint: currentConversation.botEndpoint,
      conversationId: currentConversation.conversationId,
      user: currentConversation.user,
      mode: currentConversation.chatMode,
      members: currentConversation.members,
      nextWatermark: currentConversation.nextWatermark,
    });
  };
}

export function saveTranscriptHandler(state: DLServerState) {
  return async (req: express.Request, res: express.Response): Promise<void> => {
    const { fileSavePath } = req.body;
    const conversation: Conversation = (req as any).conversation;
    if (!conversation) {
      res.status(StatusCodes.NOT_FOUND).send('Conversation not found');
      const logItem = textItem('Error', 'Cannot find a matching conversation.');
      state.dispatchers.logToDocument(req.params.conversationId, logItem);
      return;
    }

    try {
      if (!fileSavePath?.length) {
        res.status(StatusCodes.BAD_REQUEST).send('Invalid file path to save the transcript.');
      }
      await mkdirp(fileSavePath);
      const transcripts = await conversation.getTranscript();
      const contentsToWrite = typeof transcripts === 'object' ? JSON.stringify(transcripts, null, 2) : transcripts;
      writeFile(fileSavePath, contentsToWrite);
      res.status(StatusCodes.CREATED).json({
        path: req.query.fileSavePath,
        message: 'Transcript has been saved to disk sunccesfully',
      });
    } catch (ex) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ex);
    }
  };
}

export function getTranscriptHandler(state: DLServerState) {
  return async (req: express.Request, res: express.Response): Promise<any> => {
    const conversation: Conversation = (req as any).conversation;
    if (!conversation) {
      res.status(StatusCodes.NOT_FOUND).send('Conversation not found');
      const logItem = textItem('Error', 'Cannot find a matching conversation.');
      state.dispatchers.logToDocument(req.params.conversationId, logItem);
      return;
    }

    try {
      const transcripts = await conversation.getTranscript();
      res.status(StatusCodes.OK).json(transcripts);
    } catch (ex) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ex);
    }
  };
}
