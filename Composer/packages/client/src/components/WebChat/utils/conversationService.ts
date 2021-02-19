// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosInstance } from 'axios';
import { createDirectLine } from 'botframework-webchat';

export type User = {
  id: string;
  name: string;
  role: string;
};

export type BotSecrets = { msAppId: string; msPassword: string };
export type ChannelService = 'public' | 'usgov';

type WebChatMode = 'livechat' | 'transcript';
type ConversationMember = {
  id: string;
  name: string;
  role?: string;
};

type StartConversationPayload = {
  bot?: ConversationMember;
  botUrl: string;
  channelServiceType: ChannelService;
  members: ConversationMember[];
  mode: WebChatMode;
  locale: string;
  msaAppId?: string;
  msaPassword?: string;
};

// All activity types. Just parsing for Trace currently.
export enum ActivityType {
  Message = 'message',
  ContactRelationUpdate = 'contactRelationUpdate',
  ConversationUpdate = 'conversationUpdate',
  Typing = 'typing',
  EndOfConversation = 'endOfConversation',
  Event = 'event',
  Invoke = 'invoke',
  InvokeResponse = 'invokeResponse',
  DeleteUserData = 'deleteUserData',
  MessageUpdate = 'messageUpdate',
  MessageDelete = 'messageDelete',
  InstallationUpdate = 'installationUpdate',
  MessageReaction = 'messageReaction',
  Suggestion = 'suggestion',
  Trace = 'trace',
  Handoff = 'handoff',
}

export type ChatData = {
  webChatMode: WebChatMode;
  directline: {
    end: () => void;
  };
  projectId: string;
  user: User;
  conversationId: string;
};

export default class ConversationService {
  private directlineHostUrl: string;
  private composerApiClient: AxiosInstance;
  private restServerForWSPort = -1;

  constructor(directlineHostUrl: string) {
    this.directlineHostUrl = directlineHostUrl.endsWith('/') ? directlineHostUrl.slice(0, -1) : directlineHostUrl;
    this.composerApiClient = axios.create({
      baseURL: directlineHostUrl,
    });
  }

  private generateUniqueId = () => {
    return uuidv4().toString();
  };

  private async conversationUpdate(
    oldConversationId: string,
    newConversationId: string,
    userId: string,
    activeLocale: string
  ) {
    const url = `${this.directlineHostUrl}/conversations/${oldConversationId}/updateConversation`;
    return axios.put(
      url,
      {
        conversationId: newConversationId,
        userId,
        locale: activeLocale,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  private getUser(): User {
    return {
      id: uuidv4(),
      name: 'User',
      role: 'user',
    };
  }

  private async fetchDirectLineObject(
    conversationId: string,
    directLineOptions: { mode: WebChatMode; endpointId: string; userId: string }
  ) {
    const resp = await this.composerApiClient.get(`conversations/ws/port`);
    const options = {
      conversationId,
      ...directLineOptions,
    };

    const secret = btoa(JSON.stringify(options));
    this.restServerForWSPort = resp.data;

    const directLine = createDirectLine({
      token: 'emulatorToken',
      conversationId,
      secret,
      domain: `${this.directlineHostUrl}/v3/directline`,
      webSocket: true,
      streamUrl: `ws://localhost:${this.restServerForWSPort}/ws/${conversationId}`,
    });
    return directLine;
  }

  private startConversation(payload: StartConversationPayload): Promise<Response> {
    return this.composerApiClient.post(
      `v3/conversations`,
      {
        ...payload,
        bot: {
          id: uuidv4().toString(),
          name: 'Bot',
          role: 'bot',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  public async startNewConversation(
    botUrl: string,
    secrets: BotSecrets,
    projectId: string,
    activeLocale: string
  ): Promise<ChatData> {
    const webChatMode = 'livechat';
    const user = this.getUser();

    const resp: any = await this.startConversation({
      botUrl,
      channelServiceType: 'public',
      members: [user],
      mode: webChatMode,
      msaAppId: secrets.msAppId,
      msaPassword: secrets.msPassword,
      locale: activeLocale,
    });

    const conversationId: string = resp.data?.conversationId;
    const endpointId: string = resp.data?.endpointId;

    if (conversationId && endpointId) {
      const directline = await this.fetchDirectLineObject(conversationId, {
        mode: webChatMode,
        endpointId: endpointId,
        userId: user.id,
      });
      return {
        directline,
        webChatMode: webChatMode,
        projectId,
        user,
        conversationId,
      };
    }
    // TODO handle error here
    throw new Error('An error occured starting a new conversation');
  }

  public async restartConversation(oldChatData: ChatData, requireNewUserID: boolean, activeLocale: string) {
    if (oldChatData.directline) {
      oldChatData.directline.end();
    }

    const conversationId = `${this.generateUniqueId()}|${oldChatData.webChatMode}`;

    let user = oldChatData.user;
    if (requireNewUserID) {
      user = this.getUser();
    }

    const resp = await this.conversationUpdate(oldChatData.conversationId, conversationId, user.id, activeLocale);
    const { endpointId } = resp.data;
    const directline = await this.fetchDirectLineObject(conversationId, {
      mode: oldChatData.webChatMode,
      endpointId: endpointId,
      userId: user.id,
    });

    return {
      directline,
      webChatMode: oldChatData.webChatMode,
      projectId: oldChatData.projectId,
      user,
      conversationId,
    };
  }

  public connectToErrorsChannel() {
    // TODO
    // const ws = new WebSocket(`ws://localhost:${this.restServerForWSPort}/ws/createErrorChannel`);
    // ws.onmessage = (event) => {
    //   console.log('WebSocket message received:', event);
    // };
  }

  public sendInitialActivity(conversationId: string, members: [User]) {
    const url = `${this.directlineHostUrl}/v3/directline/conversations/${conversationId}/activities`;
    const activity = {
      type: 'conversationUpdate',
      membersAdded: members,
      membersRemoved: [],
    };
    return axios.post(url, activity, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async getTranscriptsData(conversationId: string) {
    return await this.composerApiClient.get(`/conversations/${conversationId}/transcripts`);
  }

  public async saveTranscriptToDisk(conversationId: string, fileSavePath: string) {
    try {
      await this.composerApiClient.post(`/conversations/${conversationId}/saveTranscript`, {
        fileSavePath,
      });
    } catch (ex) {
      // TODO: Transcript save failure
    }
  }

  public async cleanupAll() {
    await this.composerApiClient.put(`/conversations/cleanupAll`);
  }
}
