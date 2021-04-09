// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity } from 'botframework-schema';

import { createConversation, directLineGetLastResponse, directLineSendMessage } from './directLineAPI';
import { sleep } from './uitils';

export class DirectLineUtils {
  private token: string;
  private conversationId: string;
  public constructor(token: string) {
    this.token = token;
  }

  private messagesEqual(messages1: string[], messages2: string[]) {
    if (!messages1 || !messages2) {
      return false;
    }
    if (messages1.length !== messages2.length) {
      return false;
    }
    for (let i = 0; i < messages1.length; i++) {
      if (messages1[i] !== messages2[i]) {
        return false;
      }
    }
    return true;
  }

  public async sendMessage(text: string) {
    let retryCount = 3;
    while (retryCount > 0) {
      try {
        if (!this.conversationId) {
          await createConversation(this.token);
        }
        return await directLineSendMessage(text, this.conversationId, this.token);
      } catch (error) {
        console.log('comething is error while send message.');
        console.log(`Left try number: ${retryCount}.`);
        retryCount--;
        await sleep(20000);
      }
    }
    throw new Error(`sendMessage failed after 3 try times.`);
  }

  public async getLatestResponse() {
    let responseMsg = undefined;
    let retryCount = 3;
    while (!responseMsg && retryCount > 0) {
      if (!this.conversationId) {
        await createConversation(this.token);
      }

      responseMsg = await directLineGetLastResponse(this.conversationId, this.token);
      if (!responseMsg) {
        await sleep(20000);
        retryCount--;
      }
    }
    return responseMsg;
  }

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

  public async sendAndAssert(messageToSend: string, messagesToReceive: string[]) {
    const replyToActivities = await this.sendAndGetMessages(messageToSend);
    return this.messagesEqual(messagesToReceive, replyToActivities);
  }
}
