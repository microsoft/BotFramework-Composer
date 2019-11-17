// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { registerLGLanguage } from '@bfc/language-client';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
} from 'monaco-languageclient';

import { createUrl, createWebSocket } from './utils/lspUtil';
import { RichEditor, RichEditorProps } from './RichEditor';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';
const placeholder = `> To learn more about the LG file format, read the documentation at
> ${LG_HELP}`;

export interface LGOption {
  inline: boolean;
  content: string;
  template?: {
    Name: string;
    Body: string;
  };
}

export interface LGLSPEditorProps extends RichEditorProps {
  lgOption?: LGOption;
  languageServer?:
    | {
        host?: string;
        hostname?: string;
        port?: number;
        path?: string;
      }
    | string;
}

const defaultLGServer = {
  path: '/lgServer',
};

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

function startLSPClient(editor, lgServer, lgOption) {
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

export function LgEditor(props: LGLSPEditorProps) {
  const options = {
    quickSuggestions: true,
    ...props.options,
  };

  const { lgOption = {}, languageServer, ...restProps } = props;
  const lgServer = languageServer || defaultLGServer;
  const editorWillMount = monaco => {
    registerLGLanguage(monaco);
    if (typeof props.editorWillMount === 'function') {
      return props.editorWillMount(monaco);
    }
  };
  const editorDidMount = (editor, monaco) => {
    startLSPClient(editor, lgServer, lgOption);
    if (typeof props.editorDidMount === 'function') {
      return props.editorDidMount(editor, monaco);
    }
  };

  return (
    <RichEditor
      placeholder={placeholder}
      helpURL={LG_HELP}
      {...restProps}
      theme={'lgtheme'}
      language={'botbuilderlg'}
      options={options}
      editorWillMount={editorWillMount}
      editorDidMount={editorDidMount}
    />
  );
}
