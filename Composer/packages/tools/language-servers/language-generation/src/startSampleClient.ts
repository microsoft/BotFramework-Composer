import * as monaco from 'monaco-editor-core';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
} from 'monaco-languageclient';
const ReconnectingWebSocket = require('reconnecting-websocket');

export function registerLGLanguage() {
  monaco.languages.setMonarchTokensProvider('botbuilderlg', {
    tokenizer: {
      root: [
        //keywords
        [/(IF|ELSE|ELSEIF|SWITCH|CASE|DEFAULT|if|else|elseif|switch|case|default)\s*/, { token: 'keywords' }],

        // template name line
        [/^\s*#[\s\S]+/, 'template-name'],

        // template body
        [/^\s*-/, 'template-body'],

        //expression
        [/\{[\s\S]+?}/, 'expression'],

        //fence block
        [/^`{3}.+`{3}$/, 'fence-block'],

        //inline string
        [/(\").+?(\")/, 'inline-string'],

        //template-ref
        [/\[(.*?)(\(.*?(\[.+\])?\))?\]/, 'template-ref'],

        //parameters
        [/\([\s\S]*?\)\s*/, 'parameters'],

        // import statement in lg
        [/\[.*\]/, 'imports'],

        [/^\s*>[\s\S]*/, 'comments'],
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
      { token: 'template-name', foreground: '416DE7' },
      { token: 'fence-block', foreground: 'FB4C3E' },
      { token: 'expression', foreground: 'D822FF', fontStyle: 'bold' },
      { token: 'keywords', foreground: 'B44EBF' },
      { token: 'template-ref', foreground: '66D274' },
      { token: 'comments', foreground: '9CAABF' },
      { token: 'parameters', foreground: '008800' },
      { token: 'inline-string', foreground: '00EA00' },
    ],
  });
}

export function createEditor(container, file) {
  // create Monaco editor
  const { language, template, uri } = file;
  return monaco.editor.create(container!, {
    model: monaco.editor.createModel(template.Body, language, monaco.Uri.parse(uri)),
    glyphMargin: true,
    lightbulb: {
      enabled: true,
    },
    theme: 'lgtheme',
  });
}

export function startSampleClient(container, file) {
  registerLGLanguage();
  const editor = createEditor(container, file);
  // install Monaco language client services
  MonacoServices.install(editor);

  // create the web socket
  // const url = createUrl('/lgServer');
  const url = 'ws://localhost:5000/lgServer';
  const webSocket = createWebSocket(url);
  // listen when the web socket is opened
  listen({
    webSocket,
    onConnection: connection => {
      // create and start the language client
      const languageClient = createLanguageClient(connection);
      // send full content
      initializeDocuments(languageClient, file);
      const disposable = languageClient.start();
      connection.onClose(() => disposable.dispose());
    },
  });
  return editor;
}

async function initializeDocuments(languageClient, file) {
  await languageClient.onReady();
  languageClient.sendRequest('initializeDocuments', file);
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
