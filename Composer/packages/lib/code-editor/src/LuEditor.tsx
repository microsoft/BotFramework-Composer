// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuFile, TelemetryClient } from '@botframework-composer/types';
import styled from '@emotion/styled';
import { EditorDidMount, Monaco } from '@monaco-editor/react';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { MonacoLanguageClient, MonacoServices } from 'monaco-languageclient';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';

import { BaseEditor, BaseEditorProps, OnInit } from './BaseEditor';
import { defaultPlaceholder, LU_HELP } from './constants';
import { registerLULanguage } from './languages';
import { getDefaultMlEntityName } from './lu/constants';
import { useLuEntities } from './lu/hooks/useLuEntities';
import { LuEditorToolbar as DefaultLuEditorToolbar } from './lu/LuEditorToolbar';
import { LuLabelingMenu } from './lu/LuLabelingMenu';
import { ToolbarLuEntityType } from './lu/types';
import { LUOption } from './utils';
import { createLanguageClient, createUrl, createWebSocket, sendRequestWithRetry } from './utils/lspUtil';
import { computeDefineLuEntityEdits, computeInsertLuEntityEdits } from './utils/luUtils';
import { withTooltip } from './utils/withTooltip';

const LuEditorToolbar = styled(DefaultLuEditorToolbar)({
  border: `1px solid ${NeutralColors.gray120}`,
  borderBottom: 'none',
});

const linkStyles = {
  root: {
    fontSize: FluentTheme.fonts.small.fontSize,
    ':hover': { textDecoration: 'none' },
    ':active': { textDecoration: 'none' },
  },
};

const botIconStyles = { root: { padding: '0 4px', fontSize: FluentTheme.fonts.small.fontSize } };
const grayTextStyle = { root: { color: NeutralColors.gray80, fontSize: FluentTheme.fonts.small.fontSize } };

const LuSectionLink = withTooltip(
  {
    content: (
      <Text variant="small">
        {formatMessage.rich('Edit this intent in<a>User Input view</a>', {
          a: ({ children }) => (
            <Text key="pageLink" variant="small">
              <Icon iconName="People" styles={botIconStyles} />
              {children}
            </Text>
          ),
        })}
      </Text>
    ),
  },
  Link
);

const sectionLinkTokens = { childrenGap: 4 };
export interface LULSPEditorProps extends BaseEditorProps {
  luOption?: LUOption;
  helpURL?: string;
  luFile?: LuFile;
  languageServer?:
    | {
        host?: string;
        hostname?: string;
        port?: number | string;
        path: string;
      }
    | string;
  toolbarHidden?: boolean;
  telemetryClient: TelemetryClient;
  onNavigateToLuPage?: (luFileId: string, luSectionId?: string) => void;
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
convert the edits results from the server to an executable object in monaco editor
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
    folding: true,
    lightbulb: {
      enabled: true,
    },
    contextmenu: false,
    ...props.options,
  };

  const {
    toolbarHidden,
    onNavigateToLuPage,
    luOption,
    luFile,
    languageServer,
    onInit: onInitProp,
    placeholder = defaultPlaceholder,
    helpURL = LU_HELP,
    telemetryClient,
    ...restProps
  } = props;
  const luServer = languageServer || defaultLUServer;

  let editorId = '';
  if (luOption) {
    const { projectId, fileId, sectionId } = luOption;
    editorId = [projectId, fileId, sectionId].join('/');
  }

  const [editor, setEditor] = useState<any>();
  const entities = useLuEntities(luFile);

  const [labelingMenuVisible, setLabelingMenuVisible] = useState(false);
  const editorDomRef = useRef<HTMLElement | null>(null);

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
            // this is the correct way to combine key codes in Monaco
            // eslint-disable-next-line no-bitwise
            editor.addCommand(m.KeyMod.Shift | m.KeyCode.Enter, () => {
              const position = editor.getPosition();
              sendRequestWithRetry(languageClient, 'labelingExperienceRequest', { uri, position });
            });
          }

          sendRequestWithRetry(languageClient, 'initializeDocuments', { luOption, uri });

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
          sendRequestWithRetry(languageClient, 'labelingExperienceRequest', { uri, position });
        });
      }
      sendRequestWithRetry(languageClient, 'initializeDocuments', { luOption, uri });
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
    editorDomRef.current = editor.getDomNode();
    if (typeof props.editorDidMount === 'function') {
      return props.editorDidMount(_getValue, editor);
    }
  };

  const defineEntity = useCallback(
    (entityType: ToolbarLuEntityType, entityName?: string) => {
      entityName = entityName || getDefaultMlEntityName(entityType);
      if (editor) {
        const luEdits = computeDefineLuEntityEdits(entityType, entityName, editor, entities);
        if (luEdits?.edits?.length) {
          editor.executeEdits('toolbarMenu', luEdits.edits);
          if (luEdits.selection) {
            editor.setSelection(luEdits.selection);
          }

          if (luEdits?.scrollLine) {
            editor.revealLineInCenter(luEdits?.scrollLine);
          }
          telemetryClient.track('LUEditorToolbarEntityDefinitionAdded', { entityType });
          editor.focus();
        }
      }
    },
    [editor, entities]
  );

  const insertEntity = useCallback(
    (entityName: string, entityType: string, source: 'toolbar' | 'floatingMenu' = 'toolbar') => {
      if (editor) {
        const edits = computeInsertLuEntityEdits(entityName, editor);
        if (edits) {
          editor.executeEdits('toolbarMenu', edits);
          telemetryClient.track('LUEditorToolbarEntityTagAdded', {
            entityType: entityType !== 'prebuilt' ? entityType : entityName,
            source,
          });
          editor.focus();
        }
      }
    },
    [editor]
  );

  const navigateToLuPage = React.useCallback(() => {
    onNavigateToLuPage?.(luOption?.fileId ?? 'common', luOption?.sectionId);
  }, [onNavigateToLuPage, luOption]);

  const onLabelingMenuToggled = React.useCallback((visible: boolean) => setLabelingMenuVisible(visible), []);

  return (
    <>
      <Stack verticalFill>
        {!toolbarHidden && (
          <LuEditorToolbar
            editor={editor}
            labelingMenuVisible={labelingMenuVisible}
            luFile={luFile}
            onDefineEntity={defineEntity}
            onInsertEntity={insertEntity}
          />
        )}

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
        {onNavigateToLuPage && luOption && (
          <Stack horizontal tokens={sectionLinkTokens} verticalAlign="center">
            <Text styles={grayTextStyle}>{formatMessage('Intent name: ')}</Text>
            <LuSectionLink as="button" styles={linkStyles} onClick={navigateToLuPage}>
              #{luOption.sectionId}
            </LuSectionLink>
          </Stack>
        )}
      </Stack>
      <LuLabelingMenu
        editor={editor}
        luFile={luFile}
        onInsertEntity={insertEntity}
        onMenuToggled={onLabelingMenuToggled}
      />
    </>
  );
};

export { LuEditor };
