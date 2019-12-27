// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as monaco from 'monaco-editor-core';
import { listen, MessageConnection, Disposable } from 'vscode-ws-jsonrpc';
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
} from 'monaco-languageclient';

import normalizeUrl = require('normalize-url');
const ReconnectingWebSocket = require('reconnecting-websocket');

// register Monaco languages

monaco.languages.setMonarchTokensProvider('botframeworklu', {
  ignoreCase: true,
  tokenizer: {
    root: [],
  },
});

monaco.languages.register({
  id: 'bflu',
  extensions: ['.lu'],
  aliases: ['LU', 'language-understanding'],
  mimetypes: ['application/lu'],
});

monaco.languages.setLanguageConfiguration('bflu', {
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
  ],
});

monaco.editor.defineTheme('lutheme', {
  base: 'vs',
  inherit: false,
  colors: {},
  rules: [],
});

// create Monaco editor
const value = `@  ml a
@  composite la = [a, b]
 `;

const editor = monaco.editor.create(document.getElementById('container')!, {
  model: monaco.editor.createModel(value, 'bflu', monaco.Uri.parse('inmemory://model.json')),
  glyphMargin: true,
  autoClosingBrackets: 'always',
  wordBasedSuggestions: false,
  autoIndent: true,
  formatOnType: true,
  lightbulb: {
    enabled: true,
  },
  theme: 'lutheme',
});

// install Monaco language client services
MonacoServices.install(editor);

// create the web socket
const url = createUrl('/luServer');
const webSocket = createWebSocket(url);
// listen when the web socket is opened
listen({
  webSocket,
  onConnection: connection => {
    // create and start the language client
    const languageClient = createLanguageClient(connection);
    const disposable: Disposable = languageClient.start();
    connection.onClose(() => disposable.dispose());
    // editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.F9, function () {
    //   connection.sendRequest(DocumentOnTypeFormattingRequest.type );
    // });
  },
});

const keybinding = editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.F9, function() {
  if (webSocket.OPEN) {
  }
});

function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name: 'LU Language Client',
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ['bflu'],
      // disable the default error handler
      errorHandler: {
        error: () => ErrorAction.Continue,
        closed: () => CloseAction.DoNotRestart,
      },
      //middleware
    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        return Promise.resolve(createConnection(connection, errorHandler, closeHandler));
      },
    },
  });
}

function createUrl(path: string): string {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  // return normalizeUrl(`${protocol}://${location.host}${location.pathname}${path}`);
  return normalizeUrl(`${protocol}://localhost:5000${location.pathname}${path}`);
}

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
