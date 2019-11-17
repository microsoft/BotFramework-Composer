// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as monaco from 'monaco-editor-core';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
} from 'monaco-languageclient';

import { registerLGLanguage } from '../../src/index';

import { createUrl, createWebSocket } from './util';

const container: HTMLElement = document.getElementById('container') || document.body;

const content = `# Greeting1
-Good morning

# Greeting2
-Good afternoon

# Greeting3
-Good evening
`;

// const lgServer = 'ws://localhost:5000/lgServer';

const lgServer = {
  host: 'localhost:5000',
  path: '/lgServer',
};

registerLGLanguage(monaco);

const editor = monaco.editor.create(container, {
  value: content,
  glyphMargin: true,
  lightbulb: {
    enabled: true,
  },
  language: 'botbuilderlg',
  theme: 'lgtheme',
});

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

let monacoServiceInstance;

function startSampleClient(editor, lgServer, lgOption) {
  // install Monaco language client services
  if (!monacoServiceInstance) {
    monacoServiceInstance = MonacoServices.install(editor);
  }

  lgOption.uri = editor.getModel().uri._formatted;

  // create the web socket
  const url = createUrl(lgServer);
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

startSampleClient(editor, lgServer, {});
