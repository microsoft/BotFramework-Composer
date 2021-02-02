// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosInstance } from 'axios';
import { createDirectLine } from 'botframework-webchat';

export const headers = {
  'Content-Accept': 'application/json',
};

// Support US Gov later. Currently, only public clouds
export type ChannelService = 'public' | 'usgov';

interface ConversationMember {
  id: string;
  name: string;
  role?: string;
}

type WebChatMode = 'conversation' | 'transcript';

interface StartConversationPayload {
  bot?: ConversationMember;
  botUrl: string;
  channelServiceType: ChannelService;
  members: ConversationMember[];
  mode: WebChatMode;
  msaAppId?: string;
  msaPassword?: string;
}

type ChatData = {
  chatMode: 'livechat' | 'transcript';
  conversationId: string;
  directline: any;
  user: any;
};

let iterator = 1;

export class ConversationService {
  private chats: Record<string, ChatData> = {};
  private directlineHostUrl: string;
  private composerApiClient: AxiosInstance;

  constructor(directlineHostUrl: string) {
    this.directlineHostUrl = directlineHostUrl.endsWith('/') ? directlineHostUrl.slice(0, -1) : directlineHostUrl;
    this.composerApiClient = axios.create({
      baseURL: directlineHostUrl,
    });
  }

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
      test: iterator++,
    };

    const secret = btoa(JSON.stringify(options));
    console.log(secret);
    const directLine = createDirectLine({
      token: 'emulatorToken',
      conversationId,
      secret,
      domain: `${this.directlineHostUrl}/v3/directline`,
      webSocket: true,
      streamUrl: `ws://localhost:${resp.data}/ws/${conversationId}`,
    });
    return directLine;
  };

  getUser = () => {
    return {
      id: uuidv4(), // use custom id or generate new one
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

  saveChatData = (data: ChatData) => {
    this.chats[data.conversationId] = {
      ...data,
    };
  };

  getChatData = (conversationId: string) => {
    return this.chats[conversationId];
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
