// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef } from 'react';
import MonacoEditor, { EditorDidMount } from '@monaco-editor/react';
import { MessageBar, MessageBarType, Link } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useDispatcher } from '../../../hooks/useDispatcher';
import { importConfigurationState } from '../../../recoilModel/atoms/importConfigurationState';

const FullWidthMessageBar = styled(MessageBar)`
  width: 100vw;
`;
type Props = {
  onChange?: (newValue: string, hasErrors: boolean) => void;
};

const editorOptions = {
  scrollBeyondLastLine: false,
  scrollbar: {
    alwaysConsumeMouseWheel: false,
  },
  wordWrap: 'off',
  wordWrapColumn: 120,
  fontFamily: 'Courier',
  fontSize: '14px',
  fontWeight: 600,
  lineNumbers: 'off',
  quickSuggestions: false,
  minimap: {
    enabled: false,
    maxColumn: 0,
  },
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 3,
  glyphMargin: false,
  folding: false,
  renderLineHighlight: 'none',
  formatOnType: true,
  fixedOverflowWidgets: true,
};

const urls = {
  jsonOrg: 'https://www.json.org',
};

export const PublishConfigEditorStep = (props: Props) => {
  const editorRef = useRef(null);
  const [parseError, setParseError] = React.useState<string>();
  const [editorMounted, setEditorMounted] = React.useState<boolean>(false);
  const { setImportConfiguration } = useDispatcher();
  const { config, isValidConfiguration } = useRecoilValue(importConfigurationState);

  const handleOnMount: EditorDidMount = (_: () => string, editor) => {
    setEditorMounted(true);
    editorRef.current = editor;
    editor.onDidDispose(() => {
      editorRef.current = undefined;
    });
  };

  React.useEffect(() => {
    if (editorRef.current) {
      const disposable = editorRef.current.onDidChangeModelContent((e) => {
        if (editorRef.current) {
          const newValue = editorRef.current.getValue();
          setImportConfiguration(newValue);
        }
      });
      return () => {
        disposable.dispose();
      };
    }
  }, [editorMounted]);

  React.useEffect(() => {
    setParseError(isValidConfiguration ? '' : formatMessage('Invalid JSON'));
  }, [isValidConfiguration]);

  React.useEffect(() => {
    props?.onChange?.(config, !isValidConfiguration);
  }, [isValidConfiguration, config]);

  return (
    <>
      <MonacoEditor
        editorDidMount={handleOnMount}
        height={400}
        language="json"
        options={editorOptions}
        theme="light"
        value={config}
        width="100vw"
      />
      {parseError && (
        <FullWidthMessageBar
          isMultiline
          dismissButtonAriaLabel={formatMessage('Close')}
          messageBarType={MessageBarType.error}
        >
          {parseError}
          <Link key="a" href={urls.jsonOrg} rel="noopener noreferrer" target="_blank">
            {formatMessage('Refer to the syntax documentation here.')}
          </Link>
        </FullWidthMessageBar>
      )}
    </>
  );
};
