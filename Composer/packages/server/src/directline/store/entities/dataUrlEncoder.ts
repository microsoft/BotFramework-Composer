// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity, Attachment, IMessageActivity } from 'botframework-schema';
import axios from 'axios';

const maxDataUrlLength = Math.pow(2, 22);

const getBase64 = async (url: string) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return {
    content: Buffer.from(response.data, 'binary').toString('base64'),
    contentType: response.headers['content-type'],
    contentLength: parseInt(response.headers['content-length'], 10),
  };
};

export class DataUrlEncoder {
  private async visitContentUrl(attachment: Attachment): Promise<void> {
    if (attachment?.contentUrl) {
      attachment.contentUrl = await this.makeDataUrl(attachment.contentUrl);
    }
  }

  private async makeDataUrl(url: string): Promise<string> {
    let resultUrl = url;
    const { content, contentType, contentLength } = await getBase64(url);
    if (contentLength < maxDataUrlLength) {
      resultUrl = 'data:' + contentType + ';base64,' + content;
    }
    return resultUrl;
  }

  public async traverseActivity(activity: Activity): Promise<void> {
    const IMessageActivity = activity as IMessageActivity;
    if (IMessageActivity) {
      await this.traverseIMessageActivity(IMessageActivity);
    }
  }

  public async traverseIMessageActivity(IMessageActivity: IMessageActivity): Promise<void> {
    if (IMessageActivity?.attachments) {
      for (let i = 0; i < IMessageActivity.attachments.length; i++) {
        await this.traverseAttachment(IMessageActivity.attachments[i]);
      }
    }
  }

  public async traverseAttachment(attachment: Attachment): Promise<void> {
    if (attachment?.contentUrl) {
      await this.visitContentUrl(attachment);
    }
  }
}
