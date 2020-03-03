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

const LU_HELP = 'https://aka.ms/lu-file-format';
const placeholder = `> To learn more about the LU file format, read the documentation at
> ${LU_HELP}`;

export interface LUOption {
  projectId?: string;
  fileId: string;
  sectionId?: string;
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

export function LuEditor(props: LULSPEditorProps) {
  const options: monacoEditor.editor.IEditorConstructionOptions = {
    quickSuggestions: true,
    wordBasedSuggestions: false,
    formatOnType: true,
    lineNumbers: 'on',
    minimap: {
      enabled: true,
    },
    lineDecorationsWidth: undefined,
    glyphMargin: true,
    autoClosingBrackets: 'always',
    autoIndent: true,
    lightbulb: {
      enabled: true,
    },
    ...props.options,
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

          editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, function() {
            const position = editor.getPosition();
            languageClient.sendRequest('labelingExperienceRequest', { uri, position });
          });
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
      return props.editorDidMount(editor, monaco);
    }
  };

  return (
    <RichEditor
      placeholder={placeholder}
      helpURL={LU_HELP}
      {...restProps}
      theme={'lu'}
      language={'lu'}
      options={options}
      editorWillMount={editorWillMount}
      editorDidMount={editorDidMount}
    />
  );
}
