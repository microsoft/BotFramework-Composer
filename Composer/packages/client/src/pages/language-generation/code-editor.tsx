// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { LgEditor, EditorDidMount } from '@bfc/code-editor';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import { filterTemplateDiagnostics } from '@bfc/indexers';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';
import { CodeEditorSettings } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import { LgFile } from '@bfc/shared/src/types/indexers';

import { localeState, lgFilesState, projectIdState, settingsState } from '../../recoilModel/atoms/botState';
import { userSettingsState, dispatcherState } from '../../recoilModel';
import { DiffCodeEditor } from '../language-understanding/diff-editor';

const lspServerPath = '/lg-language-server';

interface CodeEditorProps extends RouteComponentProps<{}> {
  dialogId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const userSettings = useRecoilValue(userSettingsState);
  const projectId = useRecoilValue(projectIdState);
  const locale = useRecoilValue(localeState);
  const lgFiles = useRecoilValue(lgFilesState);
  const settings = useRecoilValue(settingsState);

  const { languages, defaultLanguage } = settings;

  const {
    updateLgTemplate: updateLgTemplateDispatcher,
    updateLgFile: updateLgFileDispatcher,
    updateUserSettings,
    setLocale,
  } = useRecoilValue(dispatcherState);
  const { dialogId } = props;
  const file: LgFile | undefined = lgFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const defaultLangFile = lgFiles.find(({ id }) => id === `${dialogId}.${defaultLanguage}`);

  const diagnostics = get(file, 'diagnostics', []);
  const [errorMsg, setErrorMsg] = useState('');
  const [lgEditor, setLgEditor] = useState<any>(null);

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
          projectId,
          templateName: name,
          template: {
            name,
            parameters,
            body,
          },
        };
        updateLgTemplateDispatcher(payload);
      }, 500),
    [file, template, projectId]
  );

  const updateLgFile = useMemo(
    () =>
      debounce((content: string) => {
        if (!file) return;
        const { id } = file;
        const payload = {
          id,
          projectId,
          content,
        };
        updateLgFileDispatcher(payload);
      }, 500),
    [file, projectId]
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
    [file, template, projectId]
  );

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    updateUserSettings({ codeEditor: settings });
  };

  const lgOption = {
    projectId,
    fileId: file?.id || dialogId,
    templateId: template?.name,
  };

  const currentLanguageFileEditor = useMemo(() => {
    return (
      <LgEditor
        diagnostics={currentDiagnostics}
        editorDidMount={editorDidMount}
        editorSettings={userSettings.codeEditor}
        errorMessage={errorMsg}
        hidePlaceholder={inlineMode}
        languageServer={{
          path: lspServerPath,
        }}
        lgOption={lgOption}
        value={content}
        onChange={onChange}
        onChangeSettings={handleSettingsChange}
      />
    );
  }, [lgOption]);

  const defaultLanguageFileEditor = useMemo(() => {
    return (
      <LgEditor
        editorSettings={userSettings.codeEditor}
        lgOption={{
          fileId: dialogId,
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
          onLanguageChange={setLocale}
        ></DiffCodeEditor>
      )}
    </Fragment>
  );
};

export default CodeEditor;
