// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as normalizeUrl from 'normalize-url';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { MessageConnection } from 'vscode-ws-jsonrpc';
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  createConnection,
  LanguageClientOptions,
} from 'monaco-languageclient';

export function createUrl(server: { [key: string]: string } | string): string {
  if (typeof server === 'string') {
    return normalizeUrl.default(server).replace(/^http/, 'ws');
  }
  const { host, hostname = location.hostname, port = location.port, path = '/' } = server;
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const endHost = host || `${hostname}:${port}`;
  return normalizeUrl.default(`${protocol}://${endHost}/${path}`);
}

export function createWebSocket(url: string): WebSocket {
  const socketOptions = {
    constructor: WebSocket,
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 10000,
    maxRetries: 500,
    debug: false,
  };
  return new ReconnectingWebSocket(url, [], socketOptions);
}

export function createLanguageClient(
  name: string,
  documentSelector: LanguageClientOptions['documentSelector'],
  connection: MessageConnection
): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name,
    clientOptions: {
      // use a language id as a document selector
      documentSelector,
      // disable the default error handler
      errorHandler: {
        error: () => ErrorAction.Continue,
        closed: () => CloseAction.DoNotRestart,
      },
    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        return Promise.resolve(createConnection(connection, errorHandler, closeHandler));
      },
    },
  });
}
