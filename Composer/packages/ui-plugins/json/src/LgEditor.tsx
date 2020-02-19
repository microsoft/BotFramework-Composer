// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import { monaco } from '@monaco-editor/react';
import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';
import get from 'lodash/get';
import { MonacoServices, MonacoLanguageClient } from 'monaco-languageclient';
import { FieldProps } from '@bfc/extension';

import { registerLGLanguage } from './languages';
import { createUrl, createWebSocket, createLanguageClient } from './utils/lspUtil';
import { BaseEditor } from './BaseEditor';

// const LG_HELP =
//   'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';
// const placeholder = `> To learn more about the LG file format, read the documentation at
// > ${LG_HELP}`;

interface LGOption {
  fileId: string;
  templateId: string;
}

interface LGLSPEditorProps extends FieldProps {
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

async function initMonaco() {
  const m = await monaco.init();
  registerLGLanguage(m);
}

const LgEditor: React.FC<LGLSPEditorProps> = props => {
  useEffect(() => {
    initMonaco();
  }, []);

  const options = {
    quickSuggestions: true,
    wordBasedSuggestions: false,
  };

  const { lgOption, languageServer, ...restProps } = props;
  const lgServer = languageServer || defaultLGServer;

  const editorDidMount = (getValue, editor: monacoEditor.editor.IStandaloneCodeEditor) => {
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
  };

  return (
    <BaseEditor
      {...restProps}
      invalid={false}
      editorDidMount={editorDidMount}
      language="botbuilderlg"
      options={options}
      theme="lgtheme"
    />
  );
};

export { LgEditor, LGOption, LGLSPEditorProps };
