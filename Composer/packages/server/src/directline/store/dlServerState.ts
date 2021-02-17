// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import log from '../utils/logger';

import { BotEndpoint } from './entities/botEndpoint';
import { Attachments } from './entities/attachments';
import { ConversationSet } from './entities/conversationSet';
import { EndpointSet } from './entities/endpointSet';
import { LoggerLevel, LogItem } from './types';
import { Conversation } from './entities/conversation';

export type DLServerState = {
  conversations: ConversationSet;
  endpoints: EndpointSet;
  attachments: Attachments;
  serviceUrl: string;
  dispatchers: {
    logToDocument: (
      conversationId: string,
      logMessage: LogItem<{
        level: LoggerLevel;
        text: string;
      }>
    ) => void;
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
        logToDocument: this.logToDocument,
        getDefaultEndpoint: this.getDefaultEndpoint,
        updateConversation: this.updateConversation,
      },
    };
  }

  private logToDocument(
    conversationId: string,
    logItem: LogItem<{
      level: LoggerLevel;
      text: string;
    }>
  ) {
    // TODO: Send the log item to the client Webchat instance to log errors.
    // eslint-disable-next-line no-console
    log(conversationId + logItem.payload.text);
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
