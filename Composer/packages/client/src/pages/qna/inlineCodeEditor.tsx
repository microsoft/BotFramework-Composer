// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect, useContext, useRef } from 'react';
import { LuEditor, EditorDidMount, defaultQnAPlaceholder } from '@bfc/code-editor';
import { RouteComponentProps } from '@reach/router';
import { CodeEditorSettings } from '@bfc/shared';
import get from 'lodash/get';
import querystring from 'query-string';
import { filterTemplateDiagnostics } from '@bfc/indexers';
import { QNA_HELP } from '@bfc/code-editor/lib/constants';

import { removeSection, insertSection, getParsedDiagnostics } from '../../utils/qnaUtil';
import { StoreContext } from '../../store';

interface CodeEditorProps extends RouteComponentProps<{}> {
  dialogId: string;
  indexId: number;
}

const lspServerPath = '/lu-language-server';
const InlineCodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { actions, state } = useContext(StoreContext);
  const { qnaFiles, locale, projectId, userSettings } = state;
  const { dialogId, indexId } = props;
  const file = useRef(qnaFiles.find(({ id }) => id === `${dialogId}.${locale}`)).current;
  const qnaPair = useRef(get(file, `qnaSections[${indexId}]`, {})).current;
  const diagnostics = get(file, 'diagnostics', []);
  const [templateDiagnostics, setTemplateDiagnostics] = useState(filterTemplateDiagnostics(diagnostics, qnaPair));
  const inlineContent = qnaPair?.Body;
  const hash = props.location?.hash ?? '';
  const hashLine = querystring.parse(hash).L;
  const line = Array.isArray(hashLine) ? +hashLine[0] : typeof hashLine === 'string' ? +hashLine : 0;
  const [content, setContent] = useState(inlineContent);
  const [qnaEditor, setQnAEditor] = useState<any>(null);

  useEffect(() => {
    if (qnaEditor) {
      window.requestAnimationFrame(() => {
        qnaEditor.revealLine(line);
        qnaEditor.focus();
        qnaEditor.setPosition({ lineNumber: line, column: 1 });
      });
    }
  }, [qnaEditor]);

  const editorDidMount: EditorDidMount = (_getValue, qnaEditor) => {
    setQnAEditor(qnaEditor);
  };

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    actions.updateUserSettings({ codeEditor: settings });
  };

  const onChangeContent = (newContent) => {
    setContent(newContent);
    let updatedContent = removeSection(indexId, file?.content ?? '');
    updatedContent = insertSection(indexId, updatedContent, newContent); //update or insert
    const diagnostics = getParsedDiagnostics(newContent);
    setTemplateDiagnostics(diagnostics);
    actions.updateQnaFile({ id: `${dialogId}.${locale}`, projectId, content: updatedContent });
  };

  return (
    <LuEditor
      hidePlaceholder
      diagnostics={templateDiagnostics}
      editorDidMount={editorDidMount}
      editorSettings={userSettings.codeEditor}
      helpURL={QNA_HELP}
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

export default InlineCodeEditor;
