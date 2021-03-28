// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AttachmentData } from 'botframework-schema';
import formatMessage from 'format-message';
import { StatusCodes } from 'http-status-codes';
import { DirectLineError } from '@botframework-composer/types';

import { BotErrorCodes } from '../../utils/apiErrorException';
import { generateUniqueId } from '../../utils/helpers';

export interface AttachmentWithId extends AttachmentData {
  id: string;
}

export class Attachments {
  private attachments: Record<string, AttachmentWithId> = {};

  public getAttachmentData(id: string): AttachmentWithId {
    return this.attachments[id];
  }

  public uploadAttachment(attachmentData: AttachmentData): string {
    if (!attachmentData.type) {
      const err: DirectLineError = {
        status: StatusCodes.BAD_REQUEST,
        message: formatMessage(`You must specify type property for the attachment'. ${BotErrorCodes.MissingProperty}`),
      };
      throw err;
    }

    if (!attachmentData.originalBase64) {
      const err: DirectLineError = {
        status: StatusCodes.BAD_REQUEST,
        message: formatMessage(
          `You must specify originalBase64 byte[] for the attachment'. ${BotErrorCodes.MissingProperty}`
        ),
      };
      throw err;
    }

    const attachment: AttachmentWithId = { ...attachmentData, id: generateUniqueId() };
    this.attachments[attachment.id] = attachment;
    return attachment.id;
  }
}
