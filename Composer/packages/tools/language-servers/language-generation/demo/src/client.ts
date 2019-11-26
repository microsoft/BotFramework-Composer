import * as monaco from 'monaco-editor-core';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
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

monaco.languages.setMonarchTokensProvider('botbuilderlg', {
  ignoreCase: true,
  brackets: [
    { open: '{', close: '}', token: 'delimiter.curly' },
    { open: '[', close: ']', token: 'delimiter.bracket' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' },
  ],
  tokenizer: {
    root: [
      // template name line
      [/^\s*#/, { token: 'template-name', next: '@template_name' }],
      // template body
      [/^\s*-/, { token: 'template-body-identifier', goBack: 1, next: '@template_body' }],
      //comments
      [/^\s*>/, { token: 'comments', next: '@comments' }],
    ],
    comments: [
      [/^\s*#/, { token: 'template-name', next: '@template_name' }],
      [/^\s*-/, { token: 'template-body-identifier', next: '@template_body' }],
      [/$/, 'comments', '@pop'],
    ],
    template_name: [
      //comments
      [/^\s*>/, { token: 'comments', next: '@comments' }],
      //fence block
      [/^\s*-\s*`{3}/, { token: 'fence-block', next: '@fence_block' }],
      //template_body
      [/^\s*-/, { token: 'template-body-identifier', goBack: 1, next: '@template_body' }],
      // structure_lg
      [/^\s*\[/, { token: 'structure-lg', next: '@structure_lg' }],
      //parameter in template name
      [/([a-zA-Z0-9_.'-]+)(,|\))/, ['parameter', 'delimeter']],
      //expression
      [/@\{/, { token: 'expression', next: '@expression' }],
      // other
      [/[^\()]/, 'template-name'],
    ],
    template_body: [
      //comments
      [/^\s*>/, { token: 'comments', next: '@comments' }],
      //template name
      [/^\s*#/, { token: 'template-name', next: '@template_name' }],
      //keywords
      [/(\s*-\s*)(if|else|else\s*if|switch|case|default)(\s*:)/, ['identifier', 'keywords', 'colon']],
      //fence block
      [/^\s*-\s*`{3}/, { token: 'fence-block', next: '@fence_block' }],
      //template_body
      [/^\s*-/, { token: 'template-body-identifier', next: '@template_body' }],
      //expression
      [/@\{/, { token: 'expression', next: '@expression' }],
    ],

    fence_block: [
      [/`{3}\s*$/, 'fence-block', '@pop'],
      //template name
      [/^\s*#/, { token: 'template-name', next: '@template_name' }],
      [/@\{/, { token: 'expression', next: '@expression' }],
      [/./, 'fence-block.content'],
    ],
    expression: [
      [/\}/, 'expression', '@pop'],
      [/([a-zA-Z][a-zA-Z0-9_.-]*)(\s*\()/, [{ token: 'function-name' }, { token: 'param_identifier' }]],
      [/'[\s\S]*?'/, 'string'],
      [/([a-zA-Z][a-zA-Z0-9_.-]*)(,|\))/, ['parameter', 'delimeter']],
      [/([a-zA-Z][a-zA-Z0-9_.-]*)/, 'parameter'],
      [/[0-9.]+/, 'number'],
      [/./, 'expression.content'],
    ],
    structure_lg: [
      [/^\s*\]\s*$/, 'structure-lg', '@pop'],
      [/\]\s*$/, 'imports', '@pop'],
      [/^\s*>[\s\S]*$/, 'comments'],
      [/(=|\|)([a_zA-Z0-9\s]|\@)*\{/, { token: 'expression', next: '@expression' }],
      [/^\s*@\{/, { token: 'expression', next: '@expression' }],
      [/=\s*[\s\S]+\s*$/, { token: 'structure-property' }],
      [/\s*[a-zA-Z0-9_-]+\s*$/, { token: 'structure-name' }],
      [/./, 'structure-lg.content'],
    ],
  },
});

monaco.languages.register({
  id: 'botbuilderlg',
  extensions: ['.lg'],
  aliases: ['LG', 'language-generation'],
  mimetypes: ['application/lg'],
});

monaco.editor.defineTheme('lgtheme', {
  base: 'vs',
  inherit: false,
  colors: {},
  rules: [
    { token: 'template-name', foreground: '0000FF' },
    { token: 'function-name', foreground: '79571E' },
    { token: 'keywords', foreground: '0000FF' },
    { token: 'comments', foreground: '7A7574' },
    { token: 'number', foreground: '00A32B' },
    { token: 'string', foreground: 'DF2C2C' },
    { token: 'structure-name', foreground: '00B7C3' },
  ],
});

// create Monaco editor
const value = `#ted
- hello hello
- range
- great 
- ted hello `;
const editor = monaco.editor.create(document.getElementById('container')!, {
  model: monaco.editor.createModel(value, 'botbuilderlg', monaco.Uri.parse('inmemory://model.json')),
  glyphMargin: true,
  lightbulb: {
    enabled: true,
  },
  theme: 'lgtheme',
});

// install Monaco language client services
MonacoServices.install(editor);

// create the web socket
const url = createUrl('/lgServer');
const webSocket = createWebSocket(url);
// listen when the web socket is opened
listen({
  webSocket,
  onConnection: connection => {
    // create and start the language client
    const languageClient = createLanguageClient(connection);
    const disposable = languageClient.start();
    connection.onClose(() => disposable.dispose());
  },
});

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
