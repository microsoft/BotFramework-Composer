// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useEffect, useCallback } from 'react';
import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';
import {
  ControlledEditor as MonacoEditor,
  EditorDidMount,
  ControlledEditorProps,
  ControlledEditorOnChange,
} from '@monaco-editor/react';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import formatMessage from 'format-message';

import { assignDefined } from './utils/common';

const defaultOptions: monacoEditor.editor.IEditorConstructionOptions = {
  scrollBeyondLastLine: false,
  wordWrap: 'off',
  fontFamily: 'Segoe UI',
  fontSize: 14,
  lineNumbers: 'off',
  quickSuggestions: false,
  minimap: {
    enabled: false,
  },
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 0,
  glyphMargin: false,
  folding: false,
  renderLineHighlight: 'none',
};

const styles = {
  container: ({ hovered, focused, error }) => {
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
      height: calc(100% - ${error ? 32 : 0}px);
    `;
  },
};

export interface BaseEditorProps extends Omit<ControlledEditorProps, 'height'> {
  errorMessage?: any;
  helpURL?: string;
  hidePlaceholder?: boolean;
  onChange: (newValue: string) => void;
  placeholder?: string;
  value?: string;
}

const BaseEditor: React.FC<BaseEditorProps> = props => {
  const { onChange, editorDidMount, placeholder, value, errorMessage, helpURL, ...rest } = props;
  const options = assignDefined(defaultOptions, props.options);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [editor, setEditor] = useState<monacoEditor.editor.IStandaloneCodeEditor | undefined>();

  const onEditorMount: EditorDidMount = (getValue, editor) => {
    setEditor(editor);

    if (typeof editorDidMount === 'function') {
      editorDidMount(getValue, editor);
    }
  };

  useEffect(() => {
    if (editor) {
      const onFocusListener = editor.onDidFocusEditorWidget(() => {
        setFocused(true);
      });

      const onBlurListener = editor.onDidBlurEditorWidget(() => {
        setFocused(false);
      });

      return () => {
        onFocusListener.dispose();
        onBlurListener.dispose();
      };
    }
  }, [editor]);

  const handleChange: ControlledEditorOnChange = useCallback(
    (ev, value) => {
      onChange(value || '');
    },
    [onChange]
  );

  const errorHelp =
    errorMessage &&
    formatMessage.rich('{errorMessage}. Refer to the syntax documentation<a>here</a>.', {
      errorMessage,
      a: ({ children }) => (
        <a key="a" href={helpURL} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    });

  return (
    <React.Fragment>
      <div
        css={styles.container({ hovered, focused, error: !!errorMessage })}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <MonacoEditor
          {...rest}
          editorDidMount={onEditorMount}
          value={value || placeholder}
          onChange={handleChange}
          options={options}
        />
      </div>
      {!!errorHelp && (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={false}
          dismissButtonAriaLabel={formatMessage('Close')}
          truncated
          overflowButtonAriaLabel={formatMessage('See more')}
        >
          {errorHelp}
        </MessageBar>
      )}
    </React.Fragment>
  );
};

BaseEditor.defaultProps = {
  language: 'markdown',
  theme: 'vs',
};

export { BaseEditor };
