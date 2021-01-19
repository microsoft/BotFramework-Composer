// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import { EditorDidMount, defaultQnAPlaceholder, QnAEditor } from '@bfc/code-editor';
import isEmpty from 'lodash/isEmpty';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { CodeEditorSettings } from '@bfc/shared';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import { dispatcherState, userSettingsState, qnaFilesState } from '../../recoilModel';
import { navigateTo } from '../../utils/navigation';
import { getBaseName } from '../../utils/fileUtil';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { backIcon } from './styles';
interface CodeEditorProps extends RouteComponentProps<{}> {
  dialogId: string;
  projectId: string;
  skillId?: string;
  qnaFileId?: string;
}

const lspServerPath = '/lu-language-server';
const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { projectId = '', dialogId = '', skillId } = props;
  const actualProjectId = skillId ?? projectId;
  const baseURL = skillId == null ? `/bot/${projectId}/` : `/bot/${projectId}/skill/${skillId}/`;

  const actions = useRecoilValue(dispatcherState);
  const qnaFiles = useRecoilValue(qnaFilesState(actualProjectId));
  //To do: support other languages
  const locale = 'en-us';
  //const locale = useRecoilValue(localeState);
  const userSettings = useRecoilValue(userSettingsState);

  const search = props.location?.search ?? '';
  const searchContainerId = querystring.parse(search).C;
  const searchContainerName =
    searchContainerId && typeof searchContainerId === 'string' && getBaseName(searchContainerId);
  const targetFileId =
    searchContainerId && typeof searchContainerId === 'string' ? searchContainerId : `${dialogId}.${locale}`;
  const file = qnaFiles.find(({ id }) => id === targetFileId);
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
  }, [file, actualProjectId]);

  const editorDidMount: EditorDidMount = (_getValue, qnaEditor) => {
    setQnAEditor(qnaEditor);
  };

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    actions.updateUserSettings({ codeEditor: settings });
  };

  const onChangeContent = useMemo(
    () =>
      debounce((newContent: string) => {
        actions.updateQnAFile({ id: targetFileId, content: newContent, projectId: actualProjectId });
      }, 500),
    [actualProjectId]
  );

  return (
    <Fragment>
      {searchContainerName && (
        <ActionButton
          iconProps={{
            iconName: 'ChromeBack',
          }}
          styles={backIcon}
          onClick={() => {
            navigateTo(`${baseURL}knowledge-base/${dialogId}`);
            TelemetryClient.track('EditModeToggled', { jsonView: false });
          }}
        >
          {searchContainerName}
        </ActionButton>
      )}
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
    </Fragment>
  );
};

export default CodeEditor;
