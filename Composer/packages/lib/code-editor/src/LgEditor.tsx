// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import * as monacoCore from 'monaco-editor-core';
import get from 'lodash/get';
import { MonacoServices, MonacoLanguageClient } from 'monaco-languageclient';
import { EditorDidMount, monaco } from '@monaco-editor/react';

import { registerLGLanguage } from './languages';
import { createUrl, createWebSocket, createLanguageClient } from './utils/lspUtil';
import { BaseEditor, BaseEditorProps } from './BaseEditor';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';
const placeholder = `> To learn more about the LG file format, read the documentation at
> ${LG_HELP}`;

export interface LGOption {
  fileId: string;
  templateId?: string;
}

export interface LGLSPEditorProps extends BaseEditorProps {
  lgOption?: LGOption;
  languageServer?:
    | {
        host?: string;
        hostname?: string;
        port?: number | string;
        path: string;
      }
    | string;
}

const defaultLGServer = {
  path: '/lg-language-server',
};
declare global {
  interface Window {
    monacoServiceInstance: MonacoServices;
    monacoLGEditorInstance: MonacoLanguageClient;
  }
}

async function initializeDocuments(lgOption: LGOption | undefined, uri: string) {
  const languageClient = window.monacoLGEditorInstance;
  if (languageClient) {
    await languageClient.onReady();
    languageClient.sendRequest('initializeDocuments', { uri, lgOption });
  }
}

export function LgEditor(props: LGLSPEditorProps) {
  const options = {
    quickSuggestions: true,
    wordBasedSuggestions: false,
    ...props.options,
  };

  const { lgOption, languageServer, ...restProps } = props;
  const lgServer = languageServer || defaultLGServer;

  useEffect(() => {
    monaco.init().then(instance => {
      registerLGLanguage(instance);
    });
  }, []);

  const editorDidMount: EditorDidMount = (_getValue, editor) => {
    if (!window.monacoServiceInstance) {
      window.monacoServiceInstance = MonacoServices.install(editor as monacoCore.editor.IStandaloneCodeEditor | any);
    }

    if (!window.monacoLGEditorInstance) {
      const uri = get(editor.getModel(), 'uri._formatted', '');
      const url = createUrl(lgServer);
      const webSocket: WebSocket = createWebSocket(url);
      listen({
        webSocket,
        onConnection: (connection: MessageConnection) => {
          const languageClient = createLanguageClient('LG Language Client', ['botbuilderlg'], connection);
          if (!window.monacoLGEditorInstance) {
            window.monacoLGEditorInstance = languageClient;
          }
          initializeDocuments(lgOption, uri);
          const disposable = languageClient.start();
          connection.onClose(() => disposable.dispose());
        },
      });
    } else {
      const uri = get(editor.getModel(), 'uri._formatted', '');
      initializeDocuments(lgOption, uri);
    }

    if (typeof props.editorDidMount === 'function') {
      return props.editorDidMount(_getValue, editor);
    }
  };

  return (
    <BaseEditor
      placeholder={placeholder}
      helpURL={LG_HELP}
      {...restProps}
      theme="lgtheme"
      language="botbuilderlg"
      options={options}
      editorDidMount={editorDidMount}
    />
  );
}
