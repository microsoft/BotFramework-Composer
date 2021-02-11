// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosInstance } from 'axios';
import { createDirectLine } from 'botframework-webchat';

export const headers = {
  'Content-Accept': 'application/json',
};

export type User = {
  id: string; // use custom id or generate new one
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

interface StartConversationPayload {
  bot?: ConversationMember;
  botUrl: string;
  channelServiceType: ChannelService;
  members: ConversationMember[];
  mode: WebChatMode;
  msaAppId?: string;
  msaPassword?: string;
}

export type ChatData = {
  chatMode: 'livechat' | 'transcript';
  directline: any;
  projectId: string;
  user: User;
  conversationId: string;
};

export class ConversationService {
  private directlineHostUrl: string;
  private composerApiClient: AxiosInstance;
  private restServerForWSPort = -1;

  constructor(directlineHostUrl: string) {
    this.directlineHostUrl = directlineHostUrl.endsWith('/') ? directlineHostUrl.slice(0, -1) : directlineHostUrl;
    this.composerApiClient = axios.create({
      baseURL: directlineHostUrl,
    });
  }

  startNewConversation = async (botUrl: string, secrets: BotSecrets, projectId: string): Promise<ChatData> => {
    const chatMode = 'livechat';
    const user = this.getUser();

    const resp: any = await this.startConversation({
      botUrl,
      channelServiceType: 'public',
      members: [user],
      mode: chatMode,
      msaAppId: secrets.msAppId,
      msaPassword: secrets.msPassword,
    });

    const conversationId: string = resp.data?.conversationId;
    const endpointId: string = resp.data?.endpointId;

    if (conversationId && endpointId) {
      const directline = await this.fetchDirectLineObject(conversationId, {
        mode: chatMode,
        endpointId: endpointId,
        userId: user.id,
      });
      return {
        directline,
        chatMode,
        projectId,
        user,
        conversationId,
      };
    }
    // TODO handle error here
    throw new Error('An error occured starting a new conversation');
  };

  restartConversation = async (oldChatData: ChatData, requireNewUserID: boolean) => {
    oldChatData.directline.end();
    let conversationId = oldChatData.conversationId;
    if (requireNewUserID) {
      conversationId = `${this.generateUniqueId()}|${oldChatData.chatMode}`;
    }

    let user = oldChatData.user;
    if (requireNewUserID) {
      user = this.getUser();
    }

    const resp = await this.conversationUpdate(oldChatData.conversationId, conversationId, user.id);
    const { endpointId } = resp.data;
    const directline = await this.fetchDirectLineObject(conversationId, {
      mode: oldChatData.chatMode,
      endpointId: endpointId,
      userId: user.id,
    });

    return {
      directline,
      chatMode: oldChatData.chatMode,
      projectId: oldChatData.projectId,
      user,
      conversationId,
    };
  };

  startConversation = (payload: StartConversationPayload): Promise<Response> => {
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
  };

  fetchDirectLineObject = async (
    conversationId: string,
    directLineOptions: { mode: WebChatMode; endpointId: string; userId: string }
  ) => {
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
  };

  connectToErrorsChannel = () => {
    // const ws = new WebSocket(`ws://localhost:${this.restServerForWSPort}/ws/createErrorChannel`);
    // ws.onmessage = (event) => {
    //   console.log('WebSocket message received:', event);
    // };
  };

  getUser = (): User => {
    return {
      id: uuidv4(),
      name: 'User',
      role: 'user',
    };
  };

  conversationUpdate = (oldConversationId, newConversationId, userId) => {
    const url = `${this.directlineHostUrl}/conversations/${oldConversationId}/updateConversation`;
    return axios.put(
      url,
      {
        conversationId: newConversationId,
        userId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  };

  sendInitialActivity = (conversationId, members) => {
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
  };

  generateUniqueId = () => {
    return uuidv4().toString();
  };

  getTranscriptsData = async (conversationId: string) => {
    return await this.composerApiClient.get(`/conversations/${conversationId}/transcripts`);
  };

  saveTranscriptToDisk = async (conversationId: string, fileSavePath: string) => {
    try {
      await this.composerApiClient.post(`/conversations/${conversationId}/saveTranscript`, {
        fileSavePath,
      });
    } catch (ex) {
      // TODO: Transcript save failure
    }
  };
}
