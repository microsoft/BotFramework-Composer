// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AttachmentData, AttachmentInfo } from 'botframework-schema';
import * as express from 'express';
import formatMessage from 'format-message';
import { StatusCodes } from 'http-status-codes';

import { DLServerState } from '../store/dlServerState';
import { BotErrorCodes, handleDirectLineErrors } from '../utils/apiErrorException';

type AttachmentParams = {
  attachmentId: string;
  viewId: string;
};

export function createAttachmentInfoHandler(state: DLServerState) {
  return (req: express.Request, res: express.Response): void => {
    try {
      const parms: AttachmentParams = req.params;
      const attachment: AttachmentData = state.attachments.getAttachmentData(parms.attachmentId);

      if (attachment) {
        const attachmentInfo: AttachmentInfo = {
          name: attachment.name,
          type: attachment.type,
          views: [],
        };

        if (attachment.originalBase64) {
          attachmentInfo.views.push({
            viewId: 'original',
            size: Buffer.from(Buffer.from(attachment.originalBase64.buffer as ArrayBuffer).toString(), 'base64').length,
          });
        }

        if (attachment.thumbnailBase64) {
          attachmentInfo.views.push({
            viewId: 'thumbnail',
            size: Buffer.from(Buffer.from(attachment.thumbnailBase64.buffer as ArrayBuffer).toString(), 'base64')
              .length,
          });
        }

        res.send(StatusCodes.OK, attachmentInfo).end();
      } else {
        handleDirectLineErrors(req, res, {
          status: StatusCodes.NOT_FOUND,
          message: formatMessage(`Unable to parse attachment data .${BotErrorCodes.BadArgument}`),
          errorDetails: formatMessage(`attachment[${parms.attachmentId}] not found`),
        });
      }
    } catch (err) {
      handleDirectLineErrors(req, res, err);
    }
  };
}

export function createGetAttachmentHandler(state: DLServerState) {
  return (req: express.Request, res: express.Response): void => {
    try {
      const params: AttachmentParams = req.params;
      const attachment: AttachmentData = state.attachments.getAttachmentData(params.attachmentId);

      if (attachment) {
        if (params.viewId === 'original' || params.viewId === 'thumbnail') {
          const attachmentBase64 =
            params.viewId === 'original' ? attachment.originalBase64 : attachment.thumbnailBase64;

          if (attachmentBase64) {
            // can be an ArrayBuffer if uploaded via the Web Chat paperclip control, or can be
            // an already-encoded base64 content string if sent from the bot
            let buffer;
            if (attachmentBase64.buffer) {
              buffer = Buffer.from(attachmentBase64 as any);
            } else {
              buffer = Buffer.from(attachmentBase64.toString(), 'base64');
            }

            res.type(attachment.type);
            res.send(StatusCodes.OK, buffer);
          } else {
            handleDirectLineErrors(req, res, {
              status: StatusCodes.NOT_FOUND,
              message: formatMessage(`Unable to fetch attachment data. ${BotErrorCodes.BadArgument}`),
              errorDetails:
                params.viewId === 'original'
                  ? formatMessage('There is no original view')
                  : formatMessage('There is no thumbnail view'),
            });
          }
        }
      } else {
        handleDirectLineErrors(req, res, {
          status: StatusCodes.NOT_FOUND,
          message: formatMessage(`attachment[${params.attachmentId}] not found. ${BotErrorCodes.BadArgument}`),
        });
      }
    } catch (err) {
      handleDirectLineErrors(req, res, err);
    }
  };
}
