// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef, useState, useEffect } from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import get from 'lodash/get';
import { MonacoServices, MonacoLanguageClient } from 'monaco-languageclient';
import { EditorDidMount, Monaco } from '@monaco-editor/react';
import formatMessage from 'format-message';

import { registerLULanguage } from './languages';
import { createUrl, createWebSocket, createLanguageClient, SendRequestWithRetry } from './utils/lspUtil';
import { BaseEditor, BaseEditorProps, OnInit } from './BaseEditor';
import { defaultPlaceholder, LU_HELP } from './constants';
import { LUOption } from './utils';

export interface LULSPEditorProps extends BaseEditorProps {
  luOption?: LUOption;
  helpURL?: string;
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

const LuEditor: React.FC<LULSPEditorProps> = (props) => {
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

  const {
    luOption,
    languageServer,
    onInit: onInitProp,
    placeholder = defaultPlaceholder,
    helpURL = LU_HELP,
    ...restProps
  } = props;
  const luServer = languageServer || defaultLUServer;

  let editorId = '';
  if (luOption) {
    const { projectId, fileId, sectionId } = luOption;
    editorId = [projectId, fileId, sectionId].join('/');
  }

  const [editor, setEditor] = useState<any>();

  useEffect(() => {
    if (!editor) return;

    if (!window.monacoServiceInstance) {
      window.monacoServiceInstance = MonacoServices.install(editor as any);
    }

    const uri = get(editor.getModel(), 'uri._formatted', '');

    if (!window.monacoLUEditorInstance) {
      const url = createUrl(luServer);
      const webSocket: WebSocket = createWebSocket(url);
      listen({
        webSocket,
        onConnection: (connection: MessageConnection) => {
          const languageClient = createLanguageClient(formatMessage('LU Language Client'), ['lu'], connection);

          const m = monacoRef.current;
          if (m) {
            // this is the correct way to combine keycodes in Monaco
            // eslint-disable-next-line no-bitwise
            editor.addCommand(m.KeyMod.Shift | m.KeyCode.Enter, () => {
              const position = editor.getPosition();
              SendRequestWithRetry(languageClient, 'labelingExperienceRequest', { uri, position });
            });
          }

          SendRequestWithRetry(languageClient, 'initializeDocuments', { luOption, uri });

          languageClient.onReady().then(() =>
            languageClient.onNotification('addUnlabelUtterance', (result) => {
              const edits = result.edits.map((e) => {
                return convertEdit(e);
              });
              editor.executeEdits(uri, edits);
            })
          );
          const disposable = languageClient.start();
          connection.onClose(() => disposable.dispose());
          window.monacoLUEditorInstance = languageClient;
        },
      });
    } else {
      const m = monacoRef.current;
      const languageClient = window.monacoLUEditorInstance;
      if (m) {
        // this is the correct way to combine keycodes in Monaco
        // eslint-disable-next-line no-bitwise
        editor.addCommand(m.KeyMod.Shift | m.KeyCode.Enter, () => {
          const position = editor.getPosition();
          SendRequestWithRetry(languageClient, 'labelingExperienceRequest', { uri, position });
        });
      }
      SendRequestWithRetry(languageClient, 'initializeDocuments', { luOption, uri });
    }
  }, [editor]);
  const onInit: OnInit = (monaco) => {
    registerLULanguage(monaco);
    monacoRef.current = monaco;

    if (typeof onInitProp === 'function') {
      onInitProp(monaco);
    }
  };

  const editorDidMount: EditorDidMount = (_getValue, editor) => {
    setEditor(editor);
    if (typeof props.editorDidMount === 'function') {
      return props.editorDidMount(_getValue, editor);
    }
  };

  return (
    <BaseEditor
      helpURL={LU_HELP}
      id={editorId}
      placeholder={placeholder}
      {...restProps}
      editorDidMount={editorDidMount}
      language="lu"
      options={options}
      theme="lu"
      onInit={onInit}
    />
  );
};

export { LuEditor };
