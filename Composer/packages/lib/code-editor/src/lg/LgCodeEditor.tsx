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
import { ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React, { useEffect, useState } from 'react';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import omit from 'lodash/omit';
import { createSvgIcon } from '@fluentui/react-icons';

import { BaseEditor, OnInit } from '../BaseEditor';
import { LG_HELP } from '../constants';
import { registerLGLanguage } from '../languages';
import { LgCodeEditorProps } from '../types';
import { computeRequiredEdits } from '../utils/lgUtils';
import { createLanguageClient, createUrl, createWebSocket, sendRequestWithRetry } from '../utils/lspUtil';
import { withTooltip } from '../utils/withTooltip';
import { FieldToolbar } from '../components/toolbar/FieldToolbar';
import { ToolbarButtonPayload } from '../types';

import { jsLgToolbarMenuClassName, defaultMenuHeight } from './constants';

const farItemButtonStyles = {
  root: {
    fontSize: FluentTheme.fonts.small.fontSize,
    height: defaultMenuHeight,
  },
  menuIcon: { fontSize: 8, color: NeutralColors.black },
};

const svgIconStyle = { fill: NeutralColors.black, margin: '0 4px', width: 16, height: 16 };

const popExpandSvgIcon = (
  <svg fill="none" height="16" viewBox="0 0 10 10" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.75 8.75V5.625H9.375V9.375H0.625V0.625H4.375V1.25H1.25V8.75H8.75ZM5.625 0.625H9.375V4.375H8.75V1.69434L5.21973 5.21973L4.78027 4.78027L8.30566 1.25H5.625V0.625Z"
      fill="black"
    />
  </svg>
);

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

const EditorToolbar = styled(FieldToolbar)({
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
    definitions: true,
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
    showDirectTemplateLink,
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
    if (props.options?.readOnly) {
      return;
    }

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

          languageClient.onReady().then(() =>
            languageClient.onNotification('GotoDefinition', (result) => {
              if (lgOption?.projectId) {
                onNavigateToLgPage?.(result.fileId, { templateId: result.templateId, line: result.line });
              }
            })
          );
        },
      });
    } else {
      if (!props.options?.readOnly) {
        sendRequestWithRetry(window.monacoLGEditorInstance, 'initializeDocuments', { lgOption, uri });
      }
      window.monacoLGEditorInstance.onReady().then(() =>
        window.monacoLGEditorInstance.onNotification('GotoDefinition', (result) => {
          if (lgOption?.projectId) {
            onNavigateToLgPage?.(result.fileId, { templateId: result.templateId, line: result.line });
          }
        })
      );
    }
  }, [editor, onNavigateToLgPage]);

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
    onNavigateToLgPage?.(lgOption?.fileId ?? 'common', { templateId: lgOption?.templateId, line: undefined });
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

  const toolbarFarItems = React.useMemo<ICommandBarItemProps[]>(
    () =>
      popExpandOptions
        ? [
            {
              key: 'popExpandButton',
              buttonStyles: farItemButtonStyles,
              className: jsLgToolbarMenuClassName,
              onRenderIcon: () => {
                let PopExpandIcon = createSvgIcon({ svg: () => popExpandSvgIcon, displayName: 'PopExpandIcon' });
                PopExpandIcon = withTooltip({ content: formatMessage('Pop out editor') }, PopExpandIcon);
                return <PopExpandIcon style={svgIconStyle} />;
              },
              onClick: () => {
                setExpanded(true);
                popExpandOptions.onEditorPopToggle?.(true);
              },
            },
          ]
        : [],
    [popExpandOptions]
  );

  return (
    <>
      <Stack verticalFill>
        {!toolbarHidden && (
          <EditorToolbar
            farItems={toolbarFarItems}
            lgTemplates={lgTemplates}
            properties={memoryVariables}
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
        {showDirectTemplateLink && onNavigateToLgPage && lgOption && (
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
            {...omit(props, ['popExpandOptions'])}
            height={400}
            showDirectTemplateLink={false}
            onChange={onExpandedEditorChange}
          />
        </Dialog>
      )}
    </>
  );
};
