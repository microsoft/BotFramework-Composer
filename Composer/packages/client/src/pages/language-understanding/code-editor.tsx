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
import { LuFile } from '@bfc/shared';

import { localeState, settingsState } from '../../recoilModel/atoms';
import { userSettingsState, dispatcherState, luFilesSelectorFamily } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { DiffCodeEditor } from './diff-editor';

const lspServerPath = '/lu-language-server';

interface CodeEditorProps extends RouteComponentProps<{}> {
  dialogId: string;
  projectId: string;
  skillId?: string;
  luFileId?: string;
  file?: LuFile;
}

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const userSettings = useRecoilValue(userSettingsState);
  const {
    updateLuIntent: updateLuIntentDispatcher,
    updateLuFile: updateLuFileDispatcher,
    updateUserSettings,
    setLocale,
  } = useRecoilValue(dispatcherState);
  const { dialogId, projectId, skillId, luFileId, file } = props;
  const actualProjectId = skillId ?? projectId;

  const luFiles = useRecoilValue(luFilesSelectorFamily(actualProjectId));
  const locale = useRecoilValue(localeState(actualProjectId));
  const settings = useRecoilValue(settingsState(actualProjectId));

  const { languages, defaultLanguage } = settings;

  const defaultLangFile = luFileId
    ? luFiles.find(({ id }) => id === luFileId)
    : luFiles.find(({ id }) => id === `${dialogId}.${defaultLanguage}`);

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
          projectId: actualProjectId,
          intent: {
            Name,
            Body,
          },
        };
        updateLuIntentDispatcher(payload);
      }, 500),
    [file, intent, actualProjectId]
  );

  const updateLuFile = useMemo(
    () =>
      debounce((content: string) => {
        if (!file) return;
        const { id } = file;
        const payload = {
          projectId: actualProjectId,
          id,
          content,
        };
        updateLuFileDispatcher(payload);
      }, 500),
    [file, actualProjectId]
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
    [file, intent, actualProjectId]
  );

  const luFeatures = settings?.luFeatures || {};
  const luOption = {
    projectId: actualProjectId,
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
        luFile={file}
        luOption={luOption}
        telemetryClient={TelemetryClient}
        value={content}
        onChange={onChange}
        onChangeSettings={handleSettingsChange}
      />
    );
  }, [luOption, file]);

  const defaultLanguageFileEditor = useMemo(() => {
    return (
      <LuEditor
        editorSettings={userSettings.codeEditor}
        luFile={defaultLangFile}
        luOption={{
          fileId: dialogId,
          luFeatures,
        }}
        options={{
          readOnly: true,
        }}
        telemetryClient={TelemetryClient}
        value={defaultLangContent}
        onChange={() => {}}
      />
    );
  }, [defaultLangFile, dialogId]);

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
            setLocale(locale, actualProjectId);
          }}
        ></DiffCodeEditor>
      )}
    </Fragment>
  );
};

export default CodeEditor;
