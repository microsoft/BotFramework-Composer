// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { LuEditor, EditorDidMount, defaultQnAPlaceholder } from '@bfc/code-editor';
import isEmpty from 'lodash/isEmpty';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { CodeEditorSettings } from '@bfc/shared';

import { StoreContext } from '../../store';

interface CodeEditorProps extends RouteComponentProps<{}> {
  dialogId: string;
}

const lspServerPath = '/lu-language-server';
const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { actions, state } = useContext(StoreContext);
  const { qnaFiles, locale, projectId, userSettings } = state;
  const { dialogId } = props;
  const file = qnaFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const hash = props.location?.hash ?? '';
  const hashLine = querystring.parse(hash).L;
  const line = Array.isArray(hashLine) ? +hashLine[0] : typeof hashLine === 'string' ? +hashLine : 0;
  const [content, setContent] = useState(file?.content);
  const currentDiagnostics = get(file, 'diagnostics', []);
  const [qnaEditor, setQnAEditor] = useState<any>(null);
  useEffect(() => {
    if (qnaEditor) {
      window.requestAnimationFrame(() => {
        qnaEditor.revealLine(line);
        qnaEditor.focus();
        qnaEditor.setPosition({ lineNumber: line, column: 1 });
      });
    }
  }, [line, qnaEditor]);

  useEffect(() => {
    // reset content with file.content initial state
    if (!file || isEmpty(file) || content) return;
    const value = file.content;
    setContent(value);
  }, [file, projectId]);

  const editorDidMount: EditorDidMount = (_getValue, qnaEditor) => {
    setQnAEditor(qnaEditor);
  };

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    actions.updateUserSettings({ codeEditor: settings });
  };

  const onChangeContent = useMemo(
    () =>
      debounce((newContent: string) => {
        actions.updateQnaFile({ id: `${dialogId}.${locale}`, projectId, content: newContent });
      }, 500),
    [projectId]
  );

  return (
    <LuEditor
      diagnostics={currentDiagnostics}
      editorDidMount={editorDidMount}
      editorSettings={userSettings.codeEditor}
      languageServer={{
        path: lspServerPath,
      }}
      placeholder={defaultQnAPlaceholder}
      value={content}
      onChange={onChangeContent}
      onChangeSettings={handleSettingsChange}
    />
  );
};

export default CodeEditor;
