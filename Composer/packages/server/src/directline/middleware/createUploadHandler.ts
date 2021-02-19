// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';
import { AttachmentData, Attachment } from 'botframework-schema';
import * as express from 'express';
import * as Formidable from 'formidable';

import { sendErrorResponse } from '../utils/apiErrorException';
import { DLServerState } from '../store/dlServerState';
import { Conversation } from '../store/entities/conversation';
import { textItem, statusCodeFamily } from '../utils/helpers';
import { readFile } from '../utils/fileOperations';

export const createUploadAttachmentHandler = (state: DLServerState) => {
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
};

export const createUploadHandler = (state: DLServerState) => {
  return async (req: express.Request, res: express.Response): Promise<void> => {
    const conversation: Conversation = (req as any).conversation;
    if (!conversation) {
      res.status(StatusCodes.NOT_FOUND).send('Conversation not found.').end();
      const logItem = textItem('Error', 'Cannot upload file. Conversation not found.');
      state.dispatchers.logToDocument(req.params.conversationId, logItem);
      return;
    }

    if (!req.is('multipart/form-data') || Number(req.headers['content-length']) === 0) {
      res.status(StatusCodes.BAD_REQUEST).send('Cannot parse attachment.').end();
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
          sendErrorResponse(req, res, err);
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

        try {
          const { sendActivity, status, response } = await conversation.postActivityToBot(state, activity);

          if (!statusCodeFamily(status, 200)) {
            res
              .status(status || StatusCodes.INTERNAL_SERVER_ERROR)
              .json(response.data)
              .end();
          } else {
            res.status(status).json({ id: sendActivity?.id }).end();
          }
        } catch (err) {
          sendErrorResponse(req, res, err);
        }
      } catch (err) {
        sendErrorResponse(req, res, err);
      }
    });
  };
};
