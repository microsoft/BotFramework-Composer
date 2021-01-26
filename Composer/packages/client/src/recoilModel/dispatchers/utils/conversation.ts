// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import uuidv4 from 'uuid/v4';
import { createDirectLine } from 'botframework-webchat';

import { composerServerExtensionClient } from '../../../utils/httpUtil';
import { BASEPATH } from '../../../constants';

export const headers = {
  'Content-Accept': 'application/json',
};

// Support US Gov later. Currently, only public clouds
type ChannelService = 'public';

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

export const conversationService = () => {
  const startConversation = (payload: StartConversationPayload): Promise<Response> => {
    return composerServerExtensionClient.post(
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

  const fetchDirectLineObject = async (
    conversationId: string,
    directLineOptions: { mode: WebChatMode; endpointId: string; userId: string }
  ) => {
    const webSocketPort = await composerServerExtensionClient.get(`conversations/ws/port`);
    const options = {
      conversationId,
      ...directLineOptions,
    };

    const secret = btoa(JSON.stringify(options));
    const directLine = createDirectLine({
      token: 'emulatorToken',
      conversationId,
      secret,
      domain: `${BASEPATH}/v3/directline`,
      webSocket: true,
      streamUrl: `ws://localhost:${webSocketPort}/ws/${conversationId}`,
    });
    return directLine;
  };

  const getUser = () => {
    return {
      id: uuidv4(), // use custom id or generate new one
      name: 'User',
      role: 'user',
    };
  };

  return {
    startConversation,
    getUser,
    fetchDirectLineObject,
  };
};
