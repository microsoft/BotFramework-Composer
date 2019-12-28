// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';
import * as monacoCore from 'monaco-editor-core';
import get from 'lodash/get';
import { MonacoServices, MonacoLanguageClient } from 'monaco-languageclient';

import { registerLULanguage } from './languages';
import { createUrl, createWebSocket, createLanguageClient } from './utils/lspUtil';
import { RichEditor, RichEditorProps } from './RichEditor';

const LU_HELP = 'https://github.com/microsoft/botframework-cli/blob/master/packages/lu/docs/lu-file-format.md';
const placeholder = `> To learn more about the LU file format, read the documentation at
> ${LU_HELP}`;

export interface LUOption {
  inline: boolean;
  content: string;
  template?: {
    name: string;
    parameters?: string[];
    body: string;
  };
}

export interface LULSPEditorProps extends RichEditorProps {
  luOption?: LUOption;
  languageServer?:
    | {
        host?: string;
        hostname?: string;
        port?: number | string;
        path: string;
      }
    | string;
}

const defaultLUServer = {
  path: '/lu-language-server',
};
declare global {
  interface Window {
    monacoServiceInstance: MonacoServices;
    monacoLUEditorInstance: MonacoLanguageClient;
  }
}

async function initializeDocuments(luOption: LUOption | undefined, uri: string) {
  const languageClient = window.monacoLUEditorInstance;
  if (languageClient) {
    await languageClient.onReady();
    if (luOption && luOption.inline) {
      languageClient.sendRequest('initializeDocuments', { ...luOption, uri });
    } else {
      languageClient.sendRequest('initializeDocuments', { uri });
    }
  }
}

export function LuEditor(props: LULSPEditorProps) {
  const options = {
    quickSuggestions: true,
  };

  const { luOption, languageServer, ...restProps } = props;
  const luServer = languageServer || defaultLUServer;

  const editorWillMount = (monaco: typeof monacoEditor) => {
    registerLULanguage(monaco);
    if (typeof props.editorWillMount === 'function') {
      return props.editorWillMount(monaco);
    }
  };
  const editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
    if (!window.monacoServiceInstance) {
      window.monacoServiceInstance = MonacoServices.install(editor as monacoCore.editor.IStandaloneCodeEditor | any);
    }

    if (!window.monacoLGEditorInstance) {
      const uri = get(editor.getModel(), 'uri._formatted', '');
      const url = createUrl(luServer);
      const webSocket: WebSocket = createWebSocket(url);
      listen({
        webSocket,
        onConnection: (connection: MessageConnection) => {
          const languageClient = createLanguageClient('LU Language Client', ['botframeworklu'], connection);
          if (!window.monacoLGEditorInstance) {
            window.monacoLGEditorInstance = languageClient;
          }
          initializeDocuments(luOption, uri);
          const disposable = languageClient.start();
          connection.onClose(() => disposable.dispose());
        },
      });
    } else {
      const uri = get(editor.getModel(), 'uri._formatted', '');
      initializeDocuments(luOption, uri);
    }

    if (typeof props.editorDidMount === 'function') {
      return props.editorDidMount(editor, monaco);
    }
  };

  return (
    <RichEditor
      placeholder={placeholder}
      helpURL={LU_HELP}
      {...restProps}
      theme={'lutheme'}
      language={'botframeworklu'}
      options={options}
      editorWillMount={editorWillMount}
      editorDidMount={editorDidMount}
    />
  );
}
