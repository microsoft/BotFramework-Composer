// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { LuEditor, EditorDidMount } from '@bfc/code-editor';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import { filterSectionDiagnostics } from '@bfc/indexers';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';
import { CodeEditorSettings } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { luFilesState, localeState, settingsState } from '../../recoilModel/atoms';
import { userSettingsState, dispatcherState } from '../../recoilModel';

import { DiffCodeEditor } from './diff-editor';

const lspServerPath = '/lu-language-server';

interface CodeEditorProps extends RouteComponentProps<{}> {
  dialogId: string;
  projectId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const userSettings = useRecoilValue(userSettingsState);
  const {
    updateLuIntent: updateLuIntentDispatcher,
    updateLuFile: updateLuFileDispatcher,
    updateUserSettings,
    setLocale,
  } = useRecoilValue(dispatcherState);
  const { dialogId, projectId } = props;
  const luFiles = useRecoilValue(luFilesState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const settings = useRecoilValue(settingsState(projectId));

  const { languages, defaultLanguage } = settings;

  const file = luFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const defaultLangFile = luFiles.find(({ id }) => id === `${dialogId}.${defaultLanguage}`);

  const diagnostics = get(file, 'diagnostics', []);
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
  const content = intent?.Body || file?.content;
  const defaultLangContent =
    (inlineMode && defaultLangFile?.intents.find(({ Name }) => Name === sectionId)?.Body) || defaultLangFile?.content;

  const currentDiagnostics = inlineMode && file && sectionId ? filterSectionDiagnostics(file, sectionId) : diagnostics;

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
          id: file.id,
          intentName: Name,
          projectId,
          intent: {
            Name,
            Body,
          },
        };
        updateLuIntentDispatcher(payload);
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
        updateLuFileDispatcher(payload);
      }, 500),
    [file, projectId]
  );

  const onChange = useCallback(
    (value) => {
      if (!file) return;
      if (inlineMode) {
        updateLuIntent(value);
      } else {
        updateLuFile(value);
      }
    },
    [file, intent, projectId]
  );

  const luFeatures = settings?.luFeatures || {};
  const luOption = {
    projectId,
    fileId: file?.id || dialogId,
    sectionId: intent?.Name,
    luFeatures,
  };

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    updateUserSettings({ codeEditor: settings });
  };

  const currentLanguageFileEditor = useMemo(() => {
    return (
      <LuEditor
        diagnostics={currentDiagnostics}
        editorDidMount={editorDidMount}
        editorSettings={userSettings.codeEditor}
        languageServer={{
          path: lspServerPath,
        }}
        luOption={luOption}
        value={content}
        onChange={onChange}
        onChangeSettings={handleSettingsChange}
      />
    );
  }, [luOption]);

  const defaultLanguageFileEditor = useMemo(() => {
    return (
      <LuEditor
        editorSettings={userSettings.codeEditor}
        luOption={{
          fileId: dialogId,
          luFeatures,
        }}
        options={{
          readOnly: true,
        }}
        value={defaultLangContent}
        onChange={() => {}}
      />
    );
  }, [dialogId]);

  return (
    <Fragment>
      {locale === defaultLanguage ? (
        currentLanguageFileEditor
      ) : (
        <DiffCodeEditor
          defaultLanguage={defaultLanguage}
          languages={languages}
          left={currentLanguageFileEditor}
          locale={locale}
          right={defaultLanguageFileEditor}
          onLanguageChange={(locale) => {
            setLocale(locale, projectId);
          }}
        ></DiffCodeEditor>
      )}
    </Fragment>
  );
};

export default CodeEditor;
