// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef } from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import get from 'lodash/get';
import { MonacoServices, MonacoLanguageClient } from 'monaco-languageclient';
import { EditorDidMount, Monaco } from '@monaco-editor/react';

import { registerLULanguage } from './languages';
import { createUrl, createWebSocket, createLanguageClient } from './utils/lspUtil';
import { BaseEditor, BaseEditorProps, OnInit } from './BaseEditor';
import { defaultPlaceholder, LU_HELP } from './constants';

export interface LUOption {
  projectId?: string;
  fileId: string;
  sectionId?: string;
}

export interface LULSPEditorProps extends BaseEditorProps {
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

type ServerEdit = {
  range: { start: { line: number; character: number }; end: { line: number; character: number } };
  newText: string;
};

/*
convert the edits results from the server to an exectable object in manoco editor
*/
function convertEdit(serverEdit: ServerEdit) {
  return {
    range: {
      startLineNumber: serverEdit.range.start.line,
      startColumn: serverEdit.range.start.character,
      endLineNumber: serverEdit.range.end.line,
      endColumn: serverEdit.range.end.character,
    },
    text: serverEdit.newText,
    forceMoveMarkers: true,
  };
}

async function initializeDocuments(luOption: LUOption | undefined, uri: string) {
  const languageClient = window.monacoLUEditorInstance;
  if (languageClient) {
    await languageClient.onReady();
    languageClient.sendRequest('initializeDocuments', { uri, luOption });
  }
}

const LuEditor: React.FC<LULSPEditorProps> = props => {
  const monacoRef = useRef<Monaco>();
  const options = {
    quickSuggestions: true,
    formatOnType: true,
    autoClosingBrackets: 'always' as const,
    autoIndent: 'full' as const,
    lightbulb: {
      enabled: true,
    },
    ...props.options,
  };

  const { luOption, languageServer, onInit: onInitProp, placeholder = defaultPlaceholder, ...restProps } = props;
  const luServer = languageServer || defaultLUServer;

  const onInit: OnInit = monaco => {
    registerLULanguage(monaco);
    monacoRef.current = monaco;

    if (typeof onInitProp === 'function') {
      onInitProp(monaco);
    }
  };

  const editorDidMount: EditorDidMount = (_getValue, editor) => {
    if (!window.monacoServiceInstance) {
      window.monacoServiceInstance = MonacoServices.install(editor as any);
    }

    if (!window.monacoLUEditorInstance) {
      const uri = get(editor.getModel(), 'uri._formatted', '');
      const url = createUrl(luServer);
      const webSocket: WebSocket = createWebSocket(url);
      listen({
        webSocket,
        onConnection: (connection: MessageConnection) => {
          const languageClient = createLanguageClient('LU Language Client', ['lu'], connection);
          if (!window.monacoLUEditorInstance) {
            window.monacoLUEditorInstance = languageClient;
          }

          const m = monacoRef.current;
          if (m) {
            editor.addCommand(m.KeyMod.Shift | m.KeyCode.Enter, function() {
              const position = editor.getPosition();
              languageClient.sendRequest('labelingExperienceRequest', { uri, position });
            });
          }
          initializeDocuments(luOption, uri);
          languageClient.onReady().then(() =>
            languageClient.onNotification('addUnlabelUtterance', result => {
              const edits = result.edits.map(e => {
                return convertEdit(e);
              });
              editor.executeEdits(uri, edits);
            })
          );
          const disposable = languageClient.start();
          connection.onClose(() => disposable.dispose());
        },
      });
    } else {
      const uri = get(editor.getModel(), 'uri._formatted', '');
      initializeDocuments(luOption, uri);
    }

    if (typeof props.editorDidMount === 'function') {
      return props.editorDidMount(_getValue, editor);
    }
  };

  return (
    <BaseEditor
      placeholder={placeholder}
      helpURL={LU_HELP}
      {...restProps}
      onInit={onInit}
      theme="lu"
      language="lu"
      options={options}
      editorDidMount={editorDidMount}
    />
  );
};

export { LuEditor };
