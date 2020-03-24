// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { SharedColors, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { EditorDidMount } from '@bfcomposer/react-monaco-editor';
import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';
import { Diagnostic, findErrors, findWarnings, combineSimpleMessage } from '@bfc/indexers';

import { BaseEditor, BaseEditorProps } from './BaseEditor';
import { processSize } from './utils/common';

export interface RichEditorProps extends BaseEditorProps {
  hidePlaceholder?: boolean; // default false
  placeholder?: string; // empty placeholder
  errorMsg?: string; // error text show below editor
  warningMsg?: string; // warning text show below editor
  diagnostics?: Diagnostic[]; // indexer generic diagnostic
  helpURL?: string; //  help link show below editor
  height?: number | string;
}

export function RichEditor(props: RichEditorProps) {
  const {
    errorMsg,
    warningMsg,
    diagnostics = [],
    helpURL,
    placeholder,
    hidePlaceholder = false,
    height,
    editorDidMount,
    ...rest
  } = props;

  const [editor, setEditor] = useState<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const errorMsgFromDiagnostics = useMemo(() => {
    const errors = findErrors(diagnostics);
    return errors.length ? combineSimpleMessage(errors) : '';
  }, [diagnostics]);

  const warningMsgFromDiagnostics = useMemo(() => {
    const warnings = findWarnings(diagnostics);
    return warnings.length ? combineSimpleMessage(warnings) : '';
  }, [diagnostics]);

  const hasError = !!errorMsg || !!errorMsgFromDiagnostics;
  const hasWarning = !!warningMsg || !!warningMsgFromDiagnostics;

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

  const syntaxLink = (
    <Link href={helpURL} target="_blank" rel="noopener noreferrer">
      {formatMessage('Refer to the syntax documentation here.')}
    </Link>
  );

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

  let errorMessage: JSX.Element | null = null;

  const commonProps = {
    isMultiline: true,
    dismissButtonAriaLabel: formatMessage('Close'),
    overflowButtonAriaLabel: formatMessage('See more'),
  };

  if (hasWarning) {
    borderColor = SharedColors.yellow10;
    errorMessage = (
      <MessageBar messageBarType={MessageBarType.warning} {...commonProps}>
        {warningMsg || warningMsgFromDiagnostics}
        {syntaxLink}
      </MessageBar>
    );
  }

  if (hasError) {
    borderColor = SharedColors.red20;
    errorMessage = (
      <MessageBar messageBarType={MessageBarType.error} {...commonProps}>
        {errorMsg || errorMsgFromDiagnostics}
        {syntaxLink}
      </MessageBar>
    );
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
      {errorMessage}
    </Fragment>
  );
}
