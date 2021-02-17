// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AttachmentData } from 'botframework-schema';
import { StatusCodes } from 'http-status-codes';

import { BotErrorCodes, createAPIException } from '../../utils/apiErrorException';
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
      throw createAPIException(
        StatusCodes.BAD_REQUEST,
        BotErrorCodes.MissingProperty,
        'You must specify type property for the attachment'
      );
    }

    if (!attachmentData.originalBase64) {
      throw createAPIException(
        StatusCodes.BAD_REQUEST,
        BotErrorCodes.MissingProperty,
        'You must specify originalBase64 byte[] for the attachment'
      );
    }

    const attachment: AttachmentWithId = { ...attachmentData, id: generateUniqueId() };
    this.attachments[attachment.id] = attachment;
    return attachment.id;
  }
}
