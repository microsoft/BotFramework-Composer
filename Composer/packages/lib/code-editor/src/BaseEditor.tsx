// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Editor, { EditorDidMount, EditorProps, Monaco, monaco } from '@monaco-editor/react';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';
import { Diagnostic } from '@bfc/shared';
import { findErrors, combineSimpleMessage, findWarnings } from '@bfc/indexers';

import { assignDefined } from './utils/common';
import { CodeEditorOptions } from './types';

const defaultOptions = {
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
  formatOnType: true,
};

const styles = {
  container: ({ hovered, focused, error, warning, height }) => {
    let borderColor = NeutralColors.gray120;

    if (hovered) {
      borderColor = NeutralColors.gray160;
    }

    if (focused) {
      borderColor = SharedColors.cyanBlue10;
    }

    if (warning) {
      borderColor = SharedColors.yellow10;
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
      height: calc(${typeof height === 'string' ? height : `${height}px`} - ${error ? 32 : 0}px);
    `;
  },
  settings: css`
    display: flex;
    width: 100%;
    justify-content: flex-end;
    margin-top: -26px;
    margin-bottom: 5px;
  `,
};

export type OnInit = (instance: Monaco) => void;

export interface BaseEditorProps extends EditorProps {
  diagnostics?: Diagnostic[]; // indexer generic diagnostic
  helpURL?: string;
  hidePlaceholder?: boolean;
  id?: string;
  onChange: (newValue: string) => void;
  onInit?: OnInit;
  placeholder?: string;
  value?: string;
  warningMessage?: string; // warning text show below editor
  errorMessage?: string; // error text show below editor
}

const BaseEditor: React.FC<BaseEditorProps> = props => {
  const {
    onChange,
    editorDidMount,
    placeholder,
    hidePlaceholder,
    value,
    errorMessage,
    warningMessage,
    diagnostics = [],
    helpURL,
    height = '100%',
    onInit,
    ...rest
  } = props;
  const [editorOptions, setEditorOptions] = useState(assignDefined(defaultOptions, props.options));

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [editor, setEditor] = useState<any>();
  const [configOptions, setConfigOptions] = useState<CodeEditorOptions>({
    lineNumbers: false,
    wordWrap: false,
  });
  const initialValue = useMemo(() => value || (hidePlaceholder ? '' : placeholder), []);

  const onEditorMount: EditorDidMount = (getValue, editor) => {
    setEditor(editor);

    if (typeof editorDidMount === 'function') {
      editorDidMount(getValue, editor);
    }
  };

  useEffect(() => {
    monaco.init().then(instance => {
      typeof onInit === 'function' && onInit(instance);
    });
  }, []);

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

  useEffect(() => {
    if (editor) {
      const disposable = editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });

      return () => {
        disposable.dispose();
      };
    }
  }, [onChange, editor]);

  const errorMsgFromDiagnostics = useMemo(() => {
    const errors = findErrors(diagnostics);
    return errors.length ? combineSimpleMessage(errors) : '';
  }, [diagnostics]);

  const warningMsgFromDiagnostics = useMemo(() => {
    const warnings = findWarnings(diagnostics);
    return warnings.length ? combineSimpleMessage(warnings) : '';
  }, [diagnostics]);

  const hasError = !!errorMessage || !!errorMsgFromDiagnostics;
  const hasWarning = !!warningMessage || !!warningMsgFromDiagnostics;

  const messageHelp = errorMessage || errorMsgFromDiagnostics || warningMessage || warningMsgFromDiagnostics;

  const syntaxLink = (
    <Link key="a" href={helpURL} target="_blank" rel="noopener noreferrer">
      {formatMessage('Refer to the syntax documentation here.')}
    </Link>
  );

  useEffect(() => {
    if (editor) {
      console.log('[BFC] updating options:', editorOptions);
      setEditorOptions(current => ({
        ...current,
        lineNumbers: configOptions.lineNumbers ? 'on' : 'off',
        wordWrap: configOptions.wordWrap ? 'on' : 'off',
        lineNumbersMinChars: configOptions.lineNumbers ? 3 : editorOptions.lineNumbersMinChars,
        lineDecorationsWidth: configOptions.lineNumbers ? 10 : editorOptions.lineDecorationsWidth,
      }));
    }
  }, [configOptions]);

  const handleOptionsChange = useCallback(
    (_ev, item?: IContextualMenuItem) => {
      if (item) {
        setConfigOptions(current => ({
          ...current,
          [item.key]: !current[item.key],
        }));
      }
    },
    [editorOptions]
  );

  const optionsMenuItems: IContextualMenuItem[] = useMemo(
    () => [
      {
        key: 'lineNumbers',
        text: formatMessage('Show/hide line numbers'),
        canCheck: true,
        isChecked: configOptions.lineNumbers,
        onClick: handleOptionsChange,
      },
      {
        key: 'wordWrap',
        text: formatMessage('Toggle word wrap'),
        canCheck: true,
        isChecked: configOptions.wordWrap,
        onClick: handleOptionsChange,
      },
    ],
    [editorOptions, handleOptionsChange]
  );

  return (
    <React.Fragment>
      <div css={styles.settings}>
        <IconButton
          menuProps={{ items: optionsMenuItems, shouldFocusOnMount: true }}
          iconProps={{ iconName: 'Settings' }}
          styles={{
            root: {
              fontSize: '12px',
              minWidth: 0,
              margin: 0,
              padding: '5px',
              height: 'auto',
              color: '#323130',
              background: 'transparent',
            },
            rootHovered: {
              color: '#323130',
              background: 'transparent',
            },
            rootChecked: {
              color: '#323130',
              background: 'transparent',
            },
            rootPressed: {
              color: '#323130',
              background: 'transparent',
            },
            rootExpanded: {
              color: '#323130',
              background: 'transparent',
            },
            menuIcon: {
              display: 'none',
            },
          }}
        />
      </div>
      <div
        css={styles.container({ hovered, focused, error: hasError, warning: hasWarning, height })}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Editor {...rest} value={initialValue || ''} editorDidMount={onEditorMount} options={editorOptions} />
      </div>
      {(hasError || hasWarning) && (
        <MessageBar
          messageBarType={hasError ? MessageBarType.error : hasWarning ? MessageBarType.warning : MessageBarType.info}
          isMultiline={false}
          dismissButtonAriaLabel={formatMessage('Close')}
          overflowButtonAriaLabel={formatMessage('See more')}
        >
          {messageHelp}
          {syntaxLink}
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
