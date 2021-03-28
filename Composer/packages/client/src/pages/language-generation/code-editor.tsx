// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
/** @jsx jsx */
import { EditorDidMount, LgCodeEditor } from '@bfc/code-editor';
import { LgFile } from '@bfc/extension-client';
import { filterTemplateDiagnostics } from '@bfc/indexers';
import { CodeEditorSettings } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { RouteComponentProps } from '@reach/router';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import querystring from 'query-string';
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { dispatcherState, userSettingsState } from '../../recoilModel';
import { localeState, settingsState } from '../../recoilModel/atoms/botState';
import { getMemoryVariables } from '../../recoilModel/dispatchers/utils/project';
import { lgFilesSelectorFamily } from '../../recoilModel/selectors/lg';
import TelemetryClient from '../../telemetry/TelemetryClient';
import { DiffCodeEditor } from '../language-understanding/diff-editor';

const lspServerPath = '/lg-language-server';

interface CodeEditorProps extends RouteComponentProps<{}> {
  dialogId: string;
  projectId: string;
  skillId?: string;
  lgFileId?: string;
  file?: LgFile;
}

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { dialogId, projectId, skillId, lgFileId, file } = props;
  const actualProjectId = skillId ?? projectId;

  const userSettings = useRecoilValue(userSettingsState);
  const locale = useRecoilValue(localeState(actualProjectId));
  const lgFiles = useRecoilValue(lgFilesSelectorFamily(actualProjectId));
  const settings = useRecoilValue(settingsState(actualProjectId));

  const { languages, defaultLanguage } = settings;

  const {
    updateLgTemplate: updateLgTemplateDispatcher,
    updateLgFile: updateLgFileDispatcher,
    updateUserSettings,
    setLocale,
  } = useRecoilValue(dispatcherState);

  const defaultLangFile = lgFileId
    ? lgFiles.find(({ id }) => id === lgFileId)
    : lgFiles.find(({ id }) => id === `${dialogId}.${defaultLanguage}`);

  const diagnostics = get(file, 'diagnostics', []);
  const [errorMsg, setErrorMsg] = useState('');
  const [lgEditor, setLgEditor] = useState<any>(null);
  const [memoryVariables, setMemoryVariables] = useState<string[] | undefined>();

  const search = props.location?.search ?? '';
  const searchTemplateName = querystring.parse(search).t;
  const templateId = Array.isArray(searchTemplateName)
    ? searchTemplateName[0]
    : typeof searchTemplateName === 'string'
    ? searchTemplateName
    : undefined;
  const template = templateId && file ? file.templates.find(({ name }) => name === templateId) : undefined;

  const hash = props.location?.hash ?? '';
  const hashLine = querystring.parse(hash).L;
  const line = Array.isArray(hashLine) ? +hashLine[0] : typeof hashLine === 'string' ? +hashLine : 0;

  const inlineMode = !!template;
  const content = template?.body || file?.content;
  const defaultLangContent =
    (inlineMode && defaultLangFile?.templates.find(({ name }) => name === templateId)?.body) ||
    defaultLangFile?.content;

  const currentDiagnostics =
    inlineMode && file && template ? filterTemplateDiagnostics(file, template.name) : diagnostics;

  const editorDidMount: EditorDidMount = (_getValue, lgEditor) => {
    setLgEditor(lgEditor);
  };

  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      try {
        const variables = await getMemoryVariables(projectId, { signal: abortController.signal });
        setMemoryVariables(variables);
      } catch (e) {
        // error can be due to abort
      }
    })();

    // clean up pending async request
    return () => {
      abortController.abort();
    };
  }, [projectId]);

  useEffect(() => {
    if (lgEditor) {
      window.requestAnimationFrame(() => {
        lgEditor.revealLine(line);
        lgEditor.focus();
        lgEditor.setPosition({ lineNumber: line, column: 1 });
      });
    }
  }, [line, lgEditor]);

  const updateLgTemplate = useMemo(
    () =>
      debounce((body: string) => {
        if (!file || !template) return;
        const { name, parameters } = template;
        const payload = {
          id: file.id,
          projectId: actualProjectId,
          templateName: name,
          template: {
            name,
            parameters,
            body,
          },
        };
        updateLgTemplateDispatcher(payload);
      }, 500),
    [file, template, actualProjectId]
  );

  const updateLgFile = useMemo(
    () =>
      debounce((content: string) => {
        if (!file) return;
        const { id } = file;
        const payload = {
          id,
          projectId: actualProjectId,
          content,
        };
        updateLgFileDispatcher(payload);
      }, 500),
    [file, actualProjectId]
  );

  const onChange = useCallback(
    (value) => {
      if (!file) return;
      if (inlineMode) {
        if (!template) return;
        try {
          updateLgTemplate(value);
        } catch (error) {
          setErrorMsg(error.message);
        }
      } else {
        updateLgFile(value);
      }
    },
    [file, template, actualProjectId]
  );

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    updateUserSettings({ codeEditor: settings });
  };

  const lgOption = {
    projectId: actualProjectId,
    fileId: file?.id || dialogId,
    templateId: template?.name,
  };

  const currentLanguageFileEditor = useMemo(() => {
    return (
      <LgCodeEditor
        diagnostics={currentDiagnostics}
        editorDidMount={editorDidMount}
        editorSettings={userSettings.codeEditor}
        errorMessage={errorMsg}
        hidePlaceholder={inlineMode}
        languageServer={{
          path: lspServerPath,
        }}
        lgOption={lgOption}
        lgTemplates={file?.allTemplates}
        memoryVariables={memoryVariables}
        telemetryClient={TelemetryClient}
        value={content}
        onChange={onChange}
        onChangeSettings={handleSettingsChange}
      />
    );
  }, [lgOption, userSettings.codeEditor]);

  const defaultLanguageFileEditor = (
    <LgCodeEditor
      editorSettings={userSettings.codeEditor}
      lgOption={{
        fileId: dialogId,
      }}
      lgTemplates={file?.allTemplates}
      memoryVariables={memoryVariables}
      options={{
        readOnly: true,
      }}
      telemetryClient={TelemetryClient}
      value={defaultLangContent}
      onChange={() => {}}
    />
  );

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
          onLanguageChange={(locale) => setLocale(locale, actualProjectId)}
        ></DiffCodeEditor>
      )}
    </Fragment>
  );
};

export default CodeEditor;
