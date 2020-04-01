// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';

import React, { useRef } from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import get from 'lodash/get';
import { MonacoServices, MonacoLanguageClient } from 'monaco-languageclient';
import { EditorDidMount, Monaco } from '@monaco-editor/react';
import { navigate } from '@reach/router';

import { registerLGLanguage } from './languages';
import { createUrl, createWebSocket, createLanguageClient } from './utils/lspUtil';
import { BaseEditor, BaseEditorProps, OnInit } from './BaseEditor';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';
const placeholder = `> To learn more about the LG file format, read the documentation at
> ${LG_HELP}`;

export interface LGOption {
  projectId?: string;
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
  currentPath?: string;
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

  const { lgOption, languageServer, onInit: onInitProp, ...restProps } = props;
  const lgServer = languageServer || defaultLGServer;
  const monacoRef = useRef<Monaco>();
  const onInit: OnInit = monaco => {
    registerLGLanguage(monaco);

    if (typeof onInitProp === 'function') {
      onInitProp(monaco);
    }
  };

  const editorDidMount: EditorDidMount = (_getValue, editor) => {
    const m = monacoRef.current;
    const currentPath = props.currentPath;
    if (m && currentPath) {
      editor.addCommand(m.KeyCode.Escape, function() {
        navigate(path.resolve(currentPath, '../'));
      });
    }

    if (!window.monacoServiceInstance) {
      window.monacoServiceInstance = MonacoServices.install(editor as any);
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
      onInit={onInit}
      theme="lgtheme"
      language="botbuilderlg"
      options={options}
      editorDidMount={editorDidMount}
    />
  );
}
