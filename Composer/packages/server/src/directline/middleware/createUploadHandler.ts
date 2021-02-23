// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';
import { AttachmentData, Attachment } from 'botframework-schema';
import * as express from 'express';
import * as Formidable from 'formidable';
import formatMessage from 'format-message';

import { DLServerState } from '../store/dlServerState';
import { Conversation } from '../store/entities/conversation';
import { textItem } from '../utils/helpers';
import { readFile } from '../utils/fileOperations';
import { handleDirectLineErrors } from '../utils/apiErrorException';

export const createUploadAttachmentHandler = (state: DLServerState) => {
  return (req: express.Request, res: express.Response): void => {
    const attachmentData = req.body as AttachmentData;

    try {
      const resourceId = state.attachments.uploadAttachment(attachmentData);
      const resourceResponse = { id: resourceId };
      res.status(StatusCodes.OK).json(resourceResponse);
    } catch (err) {
      handleDirectLineErrors(req, res, err);
    }
  };
};

export const createUploadHandler = (state: DLServerState) => {
  return async (req: express.Request, res: express.Response): Promise<void> => {
    const conversation: Conversation = (req as any).conversation;
    if (!conversation) {
      const message = formatMessage('Cannot upload file. Conversation not found.');
      res.status(StatusCodes.NOT_FOUND).send(message).end();
      state.dispatchers.logToDocument(req.params.conversationId, textItem('Error', message));
      return;
    }

    if (!req.is('multipart/form-data') || Number(req.headers['content-length']) === 0) {
      const message = formatMessage('Cannot parse attachment.');
      res.status(StatusCodes.NOT_FOUND).send(message).end();
      state.dispatchers.logToDocument(req.params.conversationId, textItem('Error', message));
      return;
    }

    const form = new Formidable.IncomingForm();
    form.multiples = true;
    form.keepExtensions = true;
    // TODO: Override form.onPart handler so it doesn't write temp files to disk.
    form.parse(req as any, async (err, fields, files: any) => {
      try {
        const fileContents = await readFile(files.activity.path, 'utf8');
        const activity = JSON.parse(fileContents);
        let uploads = files.file;

        if (!Array.isArray(uploads)) {
          uploads = [uploads];
        }

        if (!uploads?.length) {
          const message = formatMessage('No uploads were attached as a part of the request.');
          res.status(StatusCodes.BAD_REQUEST).send(message).end();
          state.dispatchers.logToDocument(req.params.conversationId, textItem('Error', message));
          return;
        }

        activity.attachments = [];
        for (const currentUpload of uploads) {
          const name = (currentUpload as any).name || 'file.dat';
          const type = currentUpload.type;
          const path = currentUpload.path;
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
        const { sendActivity, status } = await conversation.postActivityToBot(state, activity);
        res.status(status).json({ id: sendActivity?.id }).end();
      } catch (err) {
        handleDirectLineErrors(req, res, err);
      }
    });
  };
};
