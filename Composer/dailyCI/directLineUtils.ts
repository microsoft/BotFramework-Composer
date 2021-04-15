// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity } from 'botframework-schema';

import { createConversation, directLineGetLastResponse, directLineSendMessage } from './directLineApi';
import { sleep } from './uitils';

export class DirectLineUtils {
  private token: string;
  private conversationId: string;
  public constructor(token: string) {
    this.token = token;
  }

  /**
   * Send message by directline.
   * @param messageToSend Message to send.
   * @returns Reply activities.
   */
  public async sendAndGetMessages(messageToSend: string): Promise<string[]> {
    const messageId = await this.sendMessage(messageToSend);
    const allActivitiesResult = await this.getLatestResponse();
    const activities = allActivitiesResult.activities as Partial<Activity>[];
    const replyToActivities = activities
      .filter((element) => {
        return element.replyToId === messageId.id;
      })
      .map((element) => element.text);
    return replyToActivities;
  }

  private async sendMessage(text: string) {
    let retryCount = 10;
    while (retryCount > 0) {
      try {
        if (!this.conversationId) {
          const res = await createConversation(this.token);
          this.conversationId = res.conversationId;
        }
        return await directLineSendMessage(text, this.conversationId, this.token);
      } catch (error) {
        retryCount--;
        await sleep(10000);
      }
    }
    throw new Error(`sendMessage failed after 3 try times.`);
  }

  private async getLatestResponse() {
    let responseMsg = undefined;
    let retryCount = 10;
    while (!responseMsg && retryCount > 0) {
      if (!this.conversationId) {
        await createConversation(this.token);
      }

      responseMsg = await directLineGetLastResponse(this.conversationId, this.token);
      if (!responseMsg) {
        await sleep(10000);
        retryCount--;
      }
    }
    return responseMsg;
  }
}
