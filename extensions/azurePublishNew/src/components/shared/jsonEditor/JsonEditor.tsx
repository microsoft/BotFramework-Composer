// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css, SerializedStyles } from '@emotion/core';
import React, { useRef } from 'react';
import MonacoEditor, { EditorDidMount, EditorProps } from '@monaco-editor/react';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { MessageBar, MessageBarType, Link } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { useShellApi } from '@bfc/extension-client';

const FullWidthMessageBar = styled(MessageBar)`
  width: 100vw;
`;

const styles = {
  container: ({ hovered, focused, error, width }) => {
    let borderColor = NeutralColors.gray120;

    if (hovered) {
      borderColor = NeutralColors.gray160;
    }

    if (focused) {
      borderColor = SharedColors.cyanBlue10;
    }

    if (error) {
      borderColor = SharedColors.red20;
    }
    return css`
      border-width: ${focused ? '2px' : '1px'};
      padding: ${focused ? 0 : '1px'};
      border-style: solid;
      border-color: ${borderColor};
      transition: border-color 0.1s linear;
      box-sizing: border-box;
      width: ${typeof width === 'string' ? width : `${width}px`};
      label: BaseEditor;
    `;
  },
};

type Props = {
  onChange?: (newValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  styleOverrides?: SerializedStyles[];
  errorMessage: string;
} & Omit<EditorProps, 'options' | 'language' | 'editorDidMount'>;

const editorOptions = {
  scrollBeyondLastLine: false,
  scrollbar: {
    alwaysConsumeMouseWheel: false,
  },
  wordWrap: 'off' as any,
  wordWrapColumn: 120,
  fontFamily: 'Courier',
  fontSize: '14',
  fontWeight: '600',
  lineNumbers: 'off' as any,
  quickSuggestions: false,
  minimap: {
    enabled: false,
    maxColumn: 0,
  },
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 3,
  glyphMargin: false,
  folding: false,
  renderLineHighlight: 'none' as any,
  formatOnType: true,
  fixedOverflowWidgets: true,
};

const urls = {
  jsonOrg: 'https://www.json.org',
};
export const JsonEditor = (props: Props) => {
  const { onChange, errorMessage, onFocus, onBlur, styleOverrides = [], width = '100%' } = props;
  const editorRef = useRef(null);
  const [editorMounted, setEditorMounted] = React.useState<boolean>(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const { userSettings: { codeEditor: { fontSettings } = {} } = {} } = useShellApi();

  const handleOnMount: EditorDidMount = (_: () => string, editor) => {
    setEditorMounted(true);
    editorRef.current = editor;
    editor.onDidDispose(() => {
      editorRef.current = undefined;
    });
  };

  React.useEffect(() => {
    let disposable: any;
    if (editorRef.current) {
      disposable = editorRef.current.onDidChangeModelContent(() => {
        if (editorRef.current) {
          onChange?.(editorRef.current.getValue());
        }
      });
    }
    return () => {
      disposable?.dispose();
    };
  }, [editorMounted]);

  React.useEffect(() => {
    let onFocusListener: any;
    let onBlurListener: any;
    if (editorRef.current) {
      onFocusListener = editorRef.current.onDidFocusEditorWidget(() => {
        onFocus?.();
        setFocused(true);
      });

      onBlurListener = editorRef.current.onDidBlurEditorWidget(() => {
        onBlur?.();
        setFocused(false);
      });
    }
    return () => {
      onFocusListener?.dispose();
      onBlurListener?.dispose();
    };
  }, [editorMounted, onBlur, onFocus]);

  return (
    <div
      css={[
        styles.container({
          hovered,
          focused,
          error: !!errorMessage,
          width,
        }),
        ...styleOverrides,
      ]}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MonacoEditor
        editorDidMount={handleOnMount}
        language="json"
        options={{
          ...editorOptions,
          ...{
            fontFamily: fontSettings?.fontFamily ?? editorOptions.fontFamily,
            fontWeight: fontSettings?.fontWeight ?? editorOptions.fontWeight,
            fontSize: parseInt(fontSettings?.fontSize ?? editorOptions.fontSize),
          },
        }}
        theme="light"
        {...props}
      />
      {errorMessage && (
        <FullWidthMessageBar
          isMultiline
          dismissButtonAriaLabel={formatMessage('Close')}
          messageBarType={MessageBarType.error}
        >
          {errorMessage}
          <Link key="a" href={urls.jsonOrg} rel="noopener noreferrer" target="_blank">
            {formatMessage('Refer to the syntax documentation here.')}
          </Link>
        </FullWidthMessageBar>
      )}
    </div>
  );
};
