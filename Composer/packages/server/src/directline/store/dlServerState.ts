// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotEndpoint } from './entities/botEndpoint';
import { Attachments } from './entities/attachments';
import { ConversationSet } from './entities/conversationSet';
import { EndpointSet } from './entities/endpointSet';
import { Conversation } from './entities/conversation';

export type DLServerState = {
  conversations: ConversationSet;
  endpoints: EndpointSet;
  attachments: Attachments;
  serviceUrl: string;
  dispatchers: {
    getDefaultEndpoint: () => BotEndpoint;
    updateConversation: (conversationId: string, updatedConversation: Conversation) => void;
  };
};

class DLServerContext {
  private static instance: DLServerContext;
  public readonly state: DLServerState;

  private constructor(serverPort?: number) {
    this.state = {
      conversations: new ConversationSet(),
      endpoints: new EndpointSet(),
      attachments: new Attachments(),
      serviceUrl: serverPort ? `http://localhost:${serverPort}` : '',
      dispatchers: {
        getDefaultEndpoint: this.getDefaultEndpoint,
        updateConversation: this.updateConversation,
      },
    };
  }

  private updateConversation(conversationId: string, updatedConversation: Conversation) {
    const currentState = DLServerContext.getInstance().state;
    currentState.conversations.conversations[conversationId] = updatedConversation;
  }

  private getDefaultEndpoint(): BotEndpoint {
    const currentState = DLServerContext.getInstance().state;
    return currentState.endpoints[Object.keys(currentState.endpoints)[0]];
  }

  public static getInstance(serverPort?: number): DLServerContext {
    if (!DLServerContext.instance) {
      DLServerContext.instance = new DLServerContext(serverPort);
    }
    return DLServerContext.instance;
  }
}

export default DLServerContext;
