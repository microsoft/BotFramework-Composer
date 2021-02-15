// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosInstance } from 'axios';
import { createDirectLine } from 'botframework-webchat';

export const headers = {
  'Content-Accept': 'application/json',
};

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
export enum ActivityTypes {
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
  chatMode: 'livechat' | 'transcript';
  directline: any;
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

  startNewConversation = async (
    botUrl: string,
    secrets: BotSecrets,
    projectId: string,
    activeLocale: string
  ): Promise<ChatData> => {
    const chatMode = 'livechat';
    const user = this.getUser();

    const resp: any = await this.startConversation({
      botUrl,
      channelServiceType: 'public',
      members: [user],
      mode: chatMode,
      msaAppId: secrets.msAppId,
      msaPassword: secrets.msPassword,
      locale: activeLocale,
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

  restartConversation = async (oldChatData: ChatData, requireNewUserID: boolean, activeLocale: string) => {
    oldChatData.directline.end();
    const conversationId = `${this.generateUniqueId()}|${oldChatData.chatMode}`;

    let user = oldChatData.user;
    if (requireNewUserID) {
      user = this.getUser();
    }

    const resp = await this.conversationUpdate(oldChatData.conversationId, conversationId, user.id, activeLocale);
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

  conversationUpdate = (oldConversationId: string, newConversationId: string, userId: string, activeLocale: string) => {
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

  cleanupConversation = async (conversationId: string) => {
    await this.composerApiClient.put(`/conversations/${conversationId}/cleanup`);
  };

  cleanupAll = async () => {
    await this.composerApiClient.put(`/conversations/cleanupAll`);
  };

  createCardActionMiddleware = () => (next) => async ({ cardAction, getSignInUrl }) => {
    const { type, value } = cardAction;

    switch (type) {
      case 'signin': {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const popup = window.open();
        const url = await getSignInUrl();
        if (popup) {
          popup.location.href = url;
        }
        break;
      }

      case 'downloadFile':
      //Fall through

      case 'playAudio':
      //Fall through

      case 'playVideo':
      //Fall through

      case 'showImage':
      //Fall through

      case 'openUrl':
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        window.open(value, '_blank');
        break;

      default:
        return next({ cardAction, getSignInUrl });
    }
  };

  createActivityMiddleware = () => (next: unknown) => (...setupArgs) => (...renderArgs) => {
    const card = setupArgs[0];
    switch (card.activity.type) {
      case ActivityTypes.Trace:
        return false;

      case ActivityTypes.EndOfConversation:
        return false;

      default:
        if (typeof next === 'function') {
          const middlewareResult = next(...setupArgs);
          if (middlewareResult) {
            return middlewareResult(...renderArgs);
          }
          return false;
        }
        return false;
    }
  };
}
