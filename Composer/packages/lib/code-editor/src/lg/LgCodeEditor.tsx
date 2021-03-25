// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { EditorDidMount } from '@monaco-editor/react';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { MonacoLanguageClient, MonacoServices } from 'monaco-languageclient';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Dialog } from 'office-ui-fabric-react/lib/Dialog';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React, { useEffect, useState } from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import omit from 'lodash/omit';

import { BaseEditor, OnInit } from '../BaseEditor';
import { LG_HELP } from '../constants';
import { registerLGLanguage } from '../languages';
import { LgCodeEditorProps } from '../types';
import { computeRequiredEdits } from '../utils/lgUtils';
import { createLanguageClient, createUrl, createWebSocket, sendRequestWithRetry } from '../utils/lspUtil';
import { withTooltip } from '../utils/withTooltip';

import { LgEditorToolbar as DefaultLgEditorToolbar } from './LgEditorToolbar';
import { ToolbarButtonPayload } from './types';

const placeholder = formatMessage(
  `> To learn more about the LG file format, read the documentation at
> {lgHelp}`,
  { lgHelp: LG_HELP }
);

const linkStyles = {
  root: {
    fontSize: FluentTheme.fonts.small.fontSize,
    ':hover': { textDecoration: 'none' },
    ':active': { textDecoration: 'none' },
  },
};

const botIconStyles = { root: { padding: '0 4px', fontSize: FluentTheme.fonts.small.fontSize } };
const grayTextStyle = { root: { color: NeutralColors.gray80, fontSize: FluentTheme.fonts.small.fontSize } };

const LgTemplateLink = withTooltip(
  {
    content: (
      <Text variant="small">
        {formatMessage.rich('Edit this template in<a>Bot Response view</a>', {
          a: ({ children }) => (
            <Text key="pageLink" variant="small">
              <Icon iconName="Robot" styles={botIconStyles} />
              {children}
            </Text>
          ),
        })}
      </Text>
    ),
  },
  Link
);

const templateLinkTokens = { childrenGap: 4 };

const LgEditorToolbar = styled(DefaultLgEditorToolbar)({
  border: `1px solid ${NeutralColors.gray120}`,
  borderBottom: 'none',
});

const defaultLGServer = {
  path: '/lg-language-server',
};

declare global {
  interface Window {
    monacoServiceInstance: MonacoServices;
    monacoLGEditorInstance: MonacoLanguageClient;
  }
}

export const LgCodeEditor = (props: LgCodeEditorProps) => {
  const options = {
    quickSuggestions: true,
    wordBasedSuggestions: false,
    folding: true,
    ...props.options,
  };

  const {
    toolbarHidden,
    lgOption,
    languageServer,
    onInit: onInitProp,
    memoryVariables,
    lgTemplates,
    telemetryClient,
    onNavigateToLgPage,
    popExpandOptions,
    onChange,
    ...restProps
  } = props;

  const lgServer = languageServer || defaultLGServer;

  let editorId = '';
  if (lgOption) {
    const { projectId, fileId, templateId } = lgOption;
    editorId = [projectId, fileId, templateId].join('/');
  }

  const [editor, setEditor] = useState<any>();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!editor) return;

    if (!window.monacoServiceInstance) {
      window.monacoServiceInstance = MonacoServices.install(editor as any);
    }

    const uri = get(editor.getModel(), 'uri._formatted', '');

    if (!window.monacoLGEditorInstance) {
      const url = createUrl(lgServer);
      const webSocket: WebSocket = createWebSocket(url);
      listen({
        webSocket,
        onConnection: (connection: MessageConnection) => {
          const languageClient = createLanguageClient(
            formatMessage('LG Language Client'),
            ['botbuilderlg'],
            connection
          );
          sendRequestWithRetry(languageClient, 'initializeDocuments', { lgOption, uri });
          const disposable = languageClient.start();
          connection.onClose(() => disposable.dispose());
          window.monacoLGEditorInstance = languageClient;
        },
      });
    } else {
      sendRequestWithRetry(window.monacoLGEditorInstance, 'initializeDocuments', { lgOption, uri });
    }
  }, [editor]);

  const onInit: OnInit = (monaco) => {
    registerLGLanguage(monaco);

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

  const selectToolbarMenuItem = React.useCallback(
    (text: string, itemType: ToolbarButtonPayload['kind']) => {
      if (editor) {
        const edits = computeRequiredEdits(text, editor);
        if (edits?.length) {
          editor.executeEdits('toolbarMenu', edits);
        }
      }
      telemetryClient.track('LGQuickInsertItem', {
        itemType,
        item: itemType === 'function' ? text : undefined,
        location: 'LGCodeEditor',
      });
    },
    [editor, telemetryClient]
  );

  const navigateToLgPage = React.useCallback(() => {
    onNavigateToLgPage?.(lgOption?.fileId ?? 'common', lgOption?.templateId);
  }, [onNavigateToLgPage, lgOption]);

  const onExpandedEditorChange = React.useCallback(
    (newValue: string) => {
      editor?.getModel()?.setValue(newValue);
      onChange(newValue);
    },
    [editor, onChange]
  );

  const change = React.useCallback(
    (newValue: string, isFlush?: boolean) => {
      // Only invoke callback if it's user edits and not setValue call
      if (!isFlush) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  return (
    <>
      <Stack verticalFill>
        {!toolbarHidden && (
          <LgEditorToolbar
            lgTemplates={lgTemplates}
            properties={memoryVariables}
            onPopExpand={
              popExpandOptions
                ? () => {
                    setExpanded(true);
                    popExpandOptions.onEditorPopToggle?.(true);
                  }
                : undefined
            }
            onSelectToolbarMenuItem={selectToolbarMenuItem}
          />
        )}
        <BaseEditor
          helpURL={LG_HELP}
          id={editorId}
          placeholder={placeholder}
          onChange={change}
          {...restProps}
          editorDidMount={editorDidMount}
          language="botbuilderlg"
          options={options}
          theme="lgtheme"
          onInit={onInit}
        />
        {onNavigateToLgPage && lgOption && (
          <Stack horizontal tokens={templateLinkTokens} verticalAlign="center">
            <Text styles={grayTextStyle}>{formatMessage('Template name: ')}</Text>
            <LgTemplateLink as="button" styles={linkStyles} onClick={navigateToLgPage}>
              #{lgOption.templateId}()
            </LgTemplateLink>
          </Stack>
        )}
      </Stack>
      {expanded && (
        <Dialog
          dialogContentProps={{ title: popExpandOptions?.popExpandTitle }}
          hidden={false}
          modalProps={{
            isBlocking: true,
            styles: { main: { maxWidth: '840px !important', width: '840px !important' } },
          }}
          onDismiss={() => {
            setExpanded(false);
            popExpandOptions?.onEditorPopToggle?.(false);
          }}
        >
          <LgCodeEditor
            {...omit(props, ['onNavigateToLgPage', 'popExpandOptions'])}
            height={400}
            onChange={onExpandedEditorChange}
          />
        </Dialog>
      )}
    </>
  );
};
