// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { LuEditor, EditorDidMount } from '@bfc/code-editor';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { luIndexer, filterTemplateDiagnostics } from '@bfc/indexers';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';
import { CodeEditorSettings } from '@bfc/shared';

import { StoreContext } from '../../store';
import * as luUtil from '../../utils/luUtil';

const { parse } = luIndexer;

const lspServerPath = '/lu-language-server';

interface CodeEditorProps extends RouteComponentProps<{}> {
  dialogId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = props => {
  const { actions, state } = useContext(StoreContext);
  const { luFiles, locale, projectId, userSettings } = state;
  const { dialogId } = props;
  const file = luFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const [diagnostics, setDiagnostics] = useState(get(file, 'diagnostics', []));
  const [httpErrorMsg, setHttpErrorMsg] = useState('');
  const [luEditor, setLuEditor] = useState<any>(null);

  const search = props.location?.search ?? '';
  const searchSectionName = querystring.parse(search).t;
  const sectionId = Array.isArray(searchSectionName)
    ? searchSectionName[0]
    : typeof searchSectionName === 'string'
    ? searchSectionName
    : undefined;
  const intent = sectionId && file ? file.intents.find(({ Name }) => Name === sectionId) : undefined;

  const hash = props.location?.hash ?? '';
  const hashLine = querystring.parse(hash).L;
  const line = Array.isArray(hashLine) ? +hashLine[0] : typeof hashLine === 'string' ? +hashLine : 0;

  const inlineMode = !!intent;
  const [content, setContent] = useState(intent?.Body || file?.content);

  useEffect(() => {
    // reset content with file.content initial state
    if (!file || isEmpty(file) || content) return;
    const value = intent ? intent.Body : file.content;
    setContent(value);
  }, [file, sectionId, projectId]);

  const currentDiagnostics = inlineMode && intent ? filterTemplateDiagnostics(diagnostics, intent) : diagnostics;

  const editorDidMount: EditorDidMount = (_getValue, luEditor) => {
    setLuEditor(luEditor);
  };

  useEffect(() => {
    if (luEditor) {
      window.requestAnimationFrame(() => {
        luEditor.revealLine(line);
        luEditor.focus();
        luEditor.setPosition({ lineNumber: line, column: 1 });
      });
    }
  }, [line, luEditor]);

  const updateLuIntent = useMemo(
    () =>
      debounce((Body: string) => {
        if (!file || !intent) return;
        const { Name } = intent;
        const payload = {
          projectId,
          file,
          intentName: Name,
          intent: {
            Name,
            Body,
          },
        };
        actions.updateLuIntent(payload);
      }, 500),
    [file, intent, projectId]
  );

  const updateLuFile = useMemo(
    () =>
      debounce((content: string) => {
        if (!file) return;
        const { id } = file;
        const payload = {
          projectId,
          id,
          content,
        };
        actions.updateLuFile(payload);
      }, 500),
    [file, projectId]
  );

  const updateDiagnostics = useMemo(
    () =>
      debounce((value: string) => {
        if (!file) return;
        const { id } = file;
        if (inlineMode) {
          if (!intent) return;
          const { Name } = intent;
          const { content } = file;
          try {
            const newContent = luUtil.updateIntent(content, Name, {
              Name,
              Body: value,
            });
            const { diagnostics } = parse(newContent, id);
            setDiagnostics(diagnostics);
          } catch (error) {
            setHttpErrorMsg(error.error);
          }
        } else {
          const { diagnostics } = parse(value, id);
          setDiagnostics(diagnostics);
        }
      }, 1000),
    [file, intent, projectId]
  );

  const _onChange = useCallback(
    value => {
      setContent(value);
      updateDiagnostics(value);
      if (!file) return;
      if (inlineMode) {
        updateLuIntent(value);
      } else {
        updateLuFile(value);
      }
    },
    [file, intent, projectId]
  );

  const luOption = {
    projectId,
    fileId: file?.id || dialogId,
    sectionId: intent?.Name,
  };

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    actions.updateUserSettings({ codeEditor: settings });
  };

  return (
    <LuEditor
      editorDidMount={editorDidMount}
      value={content}
      errorMessage={httpErrorMsg}
      diagnostics={currentDiagnostics}
      luOption={luOption}
      languageServer={{
        path: lspServerPath,
      }}
      onChange={_onChange}
      editorSettings={userSettings.codeEditor}
      onChangeSettings={handleSettingsChange}
    />
  );
};

export default CodeEditor;
