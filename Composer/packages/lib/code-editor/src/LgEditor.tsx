// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';
import * as monacoCore from 'monaco-editor-core';
import get from 'lodash/get';
import { MonacoServices, MonacoLanguageClient } from 'monaco-languageclient';

import { registerLGLanguage } from './languages';
import { createUrl, createWebSocket, createLanguageClient } from './utils/lspUtil';
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
    Parameters?: string[];
    Body: string;
  };
}

export interface LGLSPEditorProps extends RichEditorProps {
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
  }
}

async function initializeDocuments(languageClient, lgOption) {
  if (lgOption && lgOption.inline) {
    await languageClient.onReady();
    languageClient.sendRequest('initializeDocuments', lgOption);
  }
}

export function LgEditor(props: LGLSPEditorProps) {
  const options = {
    quickSuggestions: true,
    ...props.options,
  };

  const { lgOption = {}, languageServer, ...restProps } = props;
  const lgServer = languageServer || defaultLGServer;

  const [monacoDisposableClient, setMonacoDisposableClient] = useState<MonacoLanguageClient | null>(null);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [modelUri, setModelUri] = useState<string | null>(null);
  // auto close connection when unmount
  useEffect(() => {
    return () => {
      if (webSocket) {
        webSocket.close();
      }
      if (monacoDisposableClient) {
        monacoDisposableClient.stop();
      }
    };
  }, [modelUri]);

  const editorWillMount = (monaco: typeof monacoEditor) => {
    registerLGLanguage(monaco);
    if (typeof props.editorWillMount === 'function') {
      return props.editorWillMount(monaco);
    }
  };
  const editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
    if (!webSocket) {
      const url = createUrl(lgServer);
      const webSocket: WebSocket = createWebSocket(url);
      setWebSocket(webSocket);

      // monacoServiceInstance must be window unique
      if (!window.monacoServiceInstance) {
        const monacoServiceInstance = MonacoServices.install(editor as (monacoCore.editor.IStandaloneCodeEditor | any));
        window.monacoServiceInstance = monacoServiceInstance;
      }

      listen({
        webSocket,
        onConnection: (connection: MessageConnection) => {
          const languageClient = createLanguageClient('LG Language Client', ['botbuilderlg'], connection);
          setMonacoDisposableClient(languageClient);
          const model = editor.getModel();
          const uri = get(model, 'uri._formatted', '');
          setModelUri(uri);
          initializeDocuments(languageClient, { ...lgOption, uri });
          const disposable = languageClient.start();
          connection.onClose(() => disposable.dispose());
        },
      });
    }

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
