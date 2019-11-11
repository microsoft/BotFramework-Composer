// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
} from 'monaco-languageclient';

const ReconnectingWebSocket = require('reconnecting-websocket');

async function initializeDocuments(languageClient, lgOption) {
  if (lgOption && lgOption.inline) {
    await languageClient.onReady();
    languageClient.sendRequest('initializeDocuments', lgOption);
  }
}

function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name: 'LG Language Client',
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ['botbuilderlg'],
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

// function createUrl(path: string): string {
//   const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
//   // return normalizeUrl(`${protocol}://${location.host}${location.pathname}${path}`);
//   return normalizeUrl(`${protocol}://localhost:5000${location.pathname}${path}`);
// }

function createWebSocket(url: string): WebSocket {
  const socketOptions = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 10000,
    maxRetries: Infinity,
    debug: false,
  };
  return new ReconnectingWebSocket(url, [], socketOptions);
}

let monacoServiceInstance;

export function startSampleClient(editor, lgServer, lgOption) {
  // install Monaco language client services
  if (!monacoServiceInstance) {
    monacoServiceInstance = MonacoServices.install(editor);
  }

  lgOption.uri = editor.getModel().uri._formatted;

  // create the web socket
  // const url = createUrl('/lgServer');
  const { url } = lgServer;
  const webSocket = createWebSocket(url);
  // listen when the web socket is opened
  listen({
    webSocket,
    onConnection: connection => {
      // create and start the language client
      const languageClient = createLanguageClient(connection);
      // send full content
      initializeDocuments(languageClient, lgOption);
      const disposable = languageClient.start();
      connection.onClose(() => disposable.dispose());
    },
  });
  return editor;
}
