// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { EditorDidMount, defaultQnAPlaceholder } from '@bfc/code-editor';
import isEmpty from 'lodash/isEmpty';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { CodeEditorSettings } from '@bfc/shared';
import { QnAEditor } from '@bfc/code-editor';

import { qnaFilesState, projectIdState } from '../../recoilModel/atoms/botState';
import { dispatcherState } from '../../recoilModel';
import { userSettingsState } from '../../recoilModel';
interface CodeEditorProps extends RouteComponentProps<{}> {
  dialogId: string;
}

const lspServerPath = '/lu-language-server';
const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const actions = useRecoilValue(dispatcherState);
  const qnaFiles = useRecoilValue(qnaFilesState);
  //To do: support other languages
  const locale = 'en-us';
  //const locale = useRecoilValue(localeState);
  const projectId = useRecoilValue(projectIdState);
  const userSettings = useRecoilValue(userSettingsState);
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
        actions.updateQnAFile({ id: `${dialogId}.${locale}`, content: newContent });
      }, 500),
    [projectId]
  );

  return (
    <QnAEditor
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
