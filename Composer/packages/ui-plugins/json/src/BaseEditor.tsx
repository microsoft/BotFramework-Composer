// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import { ControlledEditor as Editor, EditorDidMount, ControlledEditorProps } from '@monaco-editor/react';
import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

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
  container: ({ hovered, focused, invalid }) => {
    let borderColor = NeutralColors.gray120;

    if (hovered) {
      borderColor = NeutralColors.gray160;
    }

    if (focused) {
      borderColor = SharedColors.cyanBlue10;
    }

    if (invalid) {
      borderColor = SharedColors.red20;
    }

    return css`
      border-width: ${focused ? '2px' : '1px'};
      padding: ${focused ? 0 : '1px'};
      border-style: solid;
      border-color: ${borderColor};
      transition: border-color 0.1s linear;
      box-sizing: border-box;
    `;
  },
};

interface BaseEditorProps extends ControlledEditorProps {
  invalid: boolean;
}

const BaseEditor: React.FC<BaseEditorProps> = props => {
  const { invalid, editorDidMount, ...rest } = props;
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

  return (
    <div
      css={styles.container({ hovered, focused, invalid })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Editor editorDidMount={onEditorMount} height="100%" options={defaultOptions} {...rest} />
    </div>
  );
};

export { BaseEditor, BaseEditorProps };
