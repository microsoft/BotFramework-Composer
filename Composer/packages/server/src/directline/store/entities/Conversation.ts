// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity, ConversationAccount } from 'botframework-schema';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';
import updateIn from 'simple-update-in';

import { BotErrorCodes, createAPIException } from '../../utils/apiErrorException';
import { BotEndpoint } from '../../utils/botEndpoint';
import { generateUniqueId } from '../../utils/helpers';
import { DLServerState } from '../DLServerState';
import { User, WebChatMode } from '../types';

type ActivityBucket = {
  activity: Activity;
  watermark: number;
};

export class Conversation {
  public botEndpoint: BotEndpoint;
  public conversationId: string;
  public members: User[] = [];
  public chatMode: WebChatMode;
  public user: User;
  public nextWatermark = 0;
  public codeVerifier: string | undefined;

  private activities: ActivityBucket[] = [];

  constructor(botEndpoint: BotEndpoint, conversationId: string, user: User, webChatMode: WebChatMode) {
    this.botEndpoint = botEndpoint;
    this.conversationId = conversationId;
    this.members.push({
      id: botEndpoint?.botId || 'bot-1',
      name: 'Bot',
    });
    this.user = user;
    this.members.push({ id: user.id, name: user.name });
    this.chatMode = webChatMode;
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

  public async prepActivityToBeSentToBot(
    state: DLServerState,
    activity: Activity,
    recordInConversation?: boolean
  ): Promise<Activity> {
    // Do not make a shallow copy here before modifying
    activity = this.postage(this.botEndpoint.botId, activity);
    activity.from = activity.from || this.user;
    // TODO:Pass locale from the bot
    activity.locale = 'en-us';

    if (!activity.recipient.name) {
      activity.recipient.name = 'Bot';
    }

    // Fill in role field, if missing
    if (!activity.recipient.role) {
      activity.recipient.role = 'bot';
    }

    activity.serviceUrl = state.serviceUrl;

    return { ...activity };
  }

  public prepActivityToBeSentToUser(userId: string, activity: Activity): Activity {
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
      // TODO:Pass locale from the bot
      activity.locale = 'en-us';
    }

    // Fill in role field, if missing
    if (!activity.recipient.role) {
      activity.recipient.role = 'user';
    }

    // internal tracking
    this.addActivityToQueue(activity);
    return activity;
  }

  public updateActivity(updatedActivity: Activity) {
    const { id } = updatedActivity;
    const index = this.activities.findIndex((entry) => entry.activity.id === id);

    if (index === -1) {
      throw createAPIException(StatusCodes.NOT_FOUND, BotErrorCodes.BadArgument, 'not a known activity id');
    }

    this.activities = updateIn(this.activities, [index, 'activity'], (activity) => ({
      ...activity,
      ...updatedActivity,
    }));
    updatedActivity = this.activities[index].activity;
    return { id };
  }

  /**
   * Sends the activity to the conversation's bot.
   */
  public async postActivityToBot(state: DLServerState, activity: Activity, recordInConversation: boolean) {
    let updatedActivity = {
      ...activity,
    };

    if (!this.botEndpoint) {
      return {
        statusCode: StatusCodes.NOT_FOUND,
        response: undefined,
        updatedActivity: undefined,
      };
    }

    updatedActivity = await this.prepActivityToBeSentToBot(state, updatedActivity, recordInConversation);

    const options = {
      body: updatedActivity,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    let status = 200;

    // TODO Handle conversation isTranscript
    // if (!this.conversationIsTranscript) {
    const resp = await this.botEndpoint.fetchWithAuth(this.botEndpoint.botUrl, options);
    status = resp.status;
    //}

    return {
      updatedActivity,
      response: resp,
      statusCode: status,
    };
  }

  public normalize(): void {
    this.activities.length = 0;
  }
}
