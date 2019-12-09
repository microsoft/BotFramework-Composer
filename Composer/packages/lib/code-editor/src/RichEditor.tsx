// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useState, useEffect } from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { SharedColors, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { EditorDidMount } from '@bfcomposer/react-monaco-editor';
import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';

import { BaseEditor, BaseEditorProps } from './BaseEditor';
import { processSize } from './utils/common';

export interface RichEditorProps extends BaseEditorProps {
  hidePlaceholder?: boolean; // default false
  placeholder?: string; // empty placeholder
  errorMsg?: string; // error text show below editor
  helpURL?: string; //  help link show below editor
  height?: number | string;
}

export function RichEditor(props: RichEditorProps) {
  const { errorMsg, helpURL, placeholder, hidePlaceholder = false, height, editorDidMount, ...rest } = props;
  const isInvalid = !!errorMsg;
  const [editor, setEditor] = useState<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const onEditorMount: EditorDidMount = (editor, monaco) => {
    setEditor(editor);

    if (typeof editorDidMount === 'function') {
      editorDidMount(editor, monaco);
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

  // eslint-disable-next-line format-message/literal-pattern
  const errorHelp = formatMessage.rich(`${errorMsg}. Refer to the syntax documentation<a>here</a>.`, {
    a: ({ children }) => (
      <a key="a" href={helpURL} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  });

  const getHeight = () => {
    if (height === null || height === undefined) {
      return '100%';
    }

    return processSize(height);
  };

  let borderColor = NeutralColors.gray120;

  if (hovered) {
    borderColor = NeutralColors.gray160;
  }

  if (focused) {
    borderColor = SharedColors.cyanBlue10;
  }

  if (isInvalid) {
    borderColor = SharedColors.red20;
  }

  return (
    <Fragment>
      <div
        style={{
          height: `calc(${getHeight()} - 40px)`,
          borderWidth: focused ? '2px' : '1px',
          padding: focused ? 0 : '1px',
          borderStyle: 'solid',
          borderColor,
          transition: 'border-color 0.1s linear',
          boxSizing: 'border-box',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <BaseEditor {...rest} editorDidMount={onEditorMount} placeholder={hidePlaceholder ? undefined : placeholder} />
      </div>
      {isInvalid && (
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
    </Fragment>
  );
}
