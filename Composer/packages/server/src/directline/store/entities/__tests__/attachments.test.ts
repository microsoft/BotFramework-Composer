// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AttachmentData } from 'botframework-schema';

import { Attachments } from '../attachments';

describe('Attachments', () => {
  let attachment = new Attachments();

  afterEach(() => {
    attachment = new Attachments();
  });

  it('can save attachmentData.', () => {
    const attachmentData: AttachmentData = {
      type: 'file',
      name: 'test',
      originalBase64: new Uint8Array(),
      thumbnailBase64: new Uint8Array(),
    };

    const id = attachment.uploadAttachment(attachmentData);
    const saved = attachment.getAttachmentData(id);

    expect(saved.id).toEqual(id);
    expect(saved.name === attachmentData.name);
  });
});
