// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import logger from '../../logger';
import { BotEndpoint } from '../utils/botEndpoint';

import { Attachments } from './entities/Attachments';
import { ConversationSet } from './entities/ConversationSet';
import { EndpointSet } from './entities/EndpointSet';
import { LoggerLevel, LogItem } from './types';

// export const mockDLLog = logger.extend('mock-directline');

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
    console.log(conversationId + logItem.payload.text);
  }

  public getDefaultEndpoint(): BotEndpoint {
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
