// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import * as monacoCore from 'monaco-editor-core';
import get from 'lodash/get';
import { MonacoServices, MonacoLanguageClient } from 'monaco-languageclient';
import { EditorDidMount, monaco } from '@monaco-editor/react';

import { registerLULanguage } from './languages';
import { createUrl, createWebSocket, createLanguageClient } from './utils/lspUtil';
import { BaseEditor, BaseEditorProps } from './BaseEditor';

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

const LuEditor: React.FC<LULSPEditorProps> = props => {
  const options = {
    quickSuggestions: true,
    wordBasedSuggestions: false,
    formatOnType: true,
    ...props.options,
  };

  const { languageServer, ...restProps } = props;
  const luServer = languageServer || defaultLUServer;

  useEffect(() => {
    monaco.init().then(instance => {
      registerLULanguage(instance);
    });
  }, []);

  // const editorWillMount = (monaco: typeof monacoEditor) => {
  //   registerLULanguage(monaco);
  //   if (typeof props.editorWillMount === 'function') {
  //     return props.editorWillMount(monaco);
  //   }
  // };
  const editorDidMount: EditorDidMount = (_getValue, editor) => {
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

          // editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, function() {
          //   const position = editor.getPosition();
          //   languageClient.sendRequest('labelingExperienceRequest', { uri, position });
          // });
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
    }

    if (typeof props.editorDidMount === 'function') {
      return props.editorDidMount(editor, monaco);
    }
  };

  return (
    <BaseEditor
      placeholder={placeholder}
      helpURL={LU_HELP}
      {...restProps}
      theme="lu"
      language="lu"
      options={options}
      editorDidMount={editorDidMount}
    />
  );
};

export { LuEditor };
