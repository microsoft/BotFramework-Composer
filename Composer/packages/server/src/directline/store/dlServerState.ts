// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import moment from 'moment';
import { StatusCodes } from 'http-status-codes';
import { DirectLineLogType } from '@bfc/shared';

import log from '../utils/logger';
import { WebSocketServer } from '../utils/webSocketServer';

import { BotEndpoint } from './entities/botEndpoint';
import { Attachments } from './entities/attachments';
import { ConversationSet } from './entities/conversationSet';
import { EndpointSet } from './entities/endpointSet';
import { LogItem } from './types';
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
        level: DirectLineLogType;
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
      level: DirectLineLogType;
      text: string;
    }>
  ) {
    const logMessage = `${conversationId}: ${logItem.payload.text}`;
    log(logMessage);
    WebSocketServer.sendDLErrorsToSubscribers({
      message: logMessage,
      logType: logItem.payload.level,
      timestamp: moment().local().format('YYYY-MM-DD HH:mm:ss'),
      status: logItem.payload.level === 'Error' ? StatusCodes.BAD_REQUEST : StatusCodes.OK,
    });
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
