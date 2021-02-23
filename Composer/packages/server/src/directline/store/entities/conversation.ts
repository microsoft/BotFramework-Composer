// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity, ConversationAccount } from 'botframework-schema';
import formatMessage from 'format-message';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';

import { generateUniqueId } from '../../utils/helpers';
import { DLServerState } from '../dlServerState';
import { User, WebChatMode } from '../types';

import { BotEndpoint } from './botEndpoint';
import { DataUrlEncoder } from './dataUrlEncoder';

type ActivityBucket = {
  activity: Activity;
  watermark: number;
};

export type TranscriptRecord = {
  type: string;
  activity: Activity;
};

export class Conversation {
  private transcript: TranscriptRecord[] = [];
  private activities: ActivityBucket[] = [];

  public botEndpoint: BotEndpoint;
  public conversationId: string;
  public members: User[] = [];
  public chatMode: WebChatMode;
  public user: User;
  public nextWatermark = 0;
  public codeVerifier: string | undefined;
  public locale: string;

  constructor(
    botEndpoint: BotEndpoint,
    conversationId: string,
    user: User,
    webChatMode: WebChatMode,
    activeLocale = 'en-us'
  ) {
    this.botEndpoint = botEndpoint;
    this.conversationId = conversationId;
    this.members.push({
      id: botEndpoint?.botId || 'bot-1',
      name: 'Bot',
    });
    this.user = user;
    this.members.push({ id: user.id, name: user.name });
    this.chatMode = webChatMode;
    this.locale = activeLocale;
  }

  private postage(recipientId: string, activity: Partial<Activity>, isHistoric = false): Activity {
    const date = moment();
    const timestamp = isHistoric ? activity.timestamp : date.toISOString();
    const recipient = isHistoric ? activity.recipient : { id: recipientId };

    return {
      ...activity,
      id: generateUniqueId(),
      channelId: 'emulator',
      recipient,
      localTimestamp: date.format() as any,
      timestamp,
      conversation: activity.conversation || ({ id: this.conversationId } as ConversationAccount),
    } as Activity;
  }

  private addActivityToQueue(activity: Activity) {
    if (!(activity.channelData || {}).postback) {
      this.activities = [...this.activities, { activity, watermark: this.nextWatermark++ }];
    }
  }

  public prepActivityToBeSentToBot(state: DLServerState, incomingActivity: Activity): Activity {
    let activity = {
      ...incomingActivity,
    };
    activity = this.postage(this.botEndpoint.botId, activity);
    activity.from = activity.from || this.user;

    activity.locale = this.locale;

    if (!activity.recipient.name) {
      activity.recipient.name = 'Bot';
    }

    if (!activity.recipient.role) {
      activity.recipient.role = 'bot';
    }
    activity.serviceUrl = state.serviceUrl;

    this.addActivityToQueue(activity);
    this.transcript = [...this.transcript, { type: 'activity add', activity }];
    return activity;
  }

  public prepActivityToBeSentToUser(userId: string, incomingActivity: Activity): Activity {
    let activity = {
      ...incomingActivity,
    };
    activity = this.postage(userId, activity, false);
    if (!activity.from.name) {
      activity.from.name = 'Bot';
    }

    if (activity.name === 'ReceivedActivity') {
      activity.value.from.role = 'user';
    } else if (activity.name === 'SentActivity') {
      activity.value.from.role = 'bot';
    }

    if (!activity.locale) {
      activity.locale = this.locale;
    }

    if (!activity.recipient.role) {
      activity.recipient.role = 'user';
    }

    this.addActivityToQueue(activity);
    this.transcript = [...this.transcript, { type: 'activity add', activity }];

    return activity;
  }

  /**
   * Sends the activity to the conversation's bot.
   */
  public async postActivityToBot(
    state: DLServerState,
    activity: Activity
  ): Promise<{
    sendActivity: Activity;
    response: any | undefined;
    status: number;
  }> {
    let sendActivity = {
      ...activity,
    };

    if (!this.botEndpoint) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: formatMessage('Bot endpoint not available in the request'),
      };
    }

    sendActivity = this.prepActivityToBeSentToBot(state, sendActivity);
    const options = {
      body: sendActivity,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = await this.botEndpoint.fetchWithAuth(this.botEndpoint.botUrl, options);
    const status = response.status;

    return {
      sendActivity,
      response,
      status,
    };
  }

  public clearConversation(): void {
    this.transcript.length = 0;
    this.activities.length = 0;
  }

  public async processActivityForDataUrls(incomingActivity: Activity): Promise<Activity> {
    const visitor = new DataUrlEncoder();
    const activity = { ...incomingActivity };
    await visitor.traverseActivity(activity);
    return activity;
  }

  public async getTranscript(): Promise<Activity[]> {
    const activities = this.transcript
      .filter((record) => record.type === 'activity add')
      .map((record) => record.activity);

    for (let i = 0; i < activities.length; i++) {
      await this.processActivityForDataUrls(activities[i]);
    }
    return activities;
  }
}
