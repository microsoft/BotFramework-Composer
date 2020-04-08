// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { LgEditor, EditorDidMount } from '@bfc/code-editor';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { lgIndexer, filterTemplateDiagnostics } from '@bfc/indexers';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';
import { CodeEditorSettings } from '@bfc/shared';

import { StoreContext } from '../../store';
import * as lgUtil from '../../utils/lgUtil';

const { parse } = lgIndexer;

const lspServerPath = '/lg-language-server';

interface CodeEditorProps extends RouteComponentProps<{}> {
  dialogId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = props => {
  const { actions, state, resolvers } = useContext(StoreContext);
  const { lgFiles, locale, projectId, userSettings } = state;
  const { lgImportresolver } = resolvers;
  const { dialogId } = props;
  const file = lgFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const [diagnostics, setDiagnostics] = useState(get(file, 'diagnostics', []));
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
  const [content, setContent] = useState(template?.body || file?.content);

  useEffect(() => {
    // reset content with file.content's initial state
    if (!file || isEmpty(file) || content) return;
    const value = template ? template.body : file.content;
    setContent(value);
  }, [file, templateId, projectId]);

  const currentDiagnostics = inlineMode && template ? filterTemplateDiagnostics(diagnostics, template) : diagnostics;

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
          file,
          projectId,
          templateName: name,
          template: {
            name,
            parameters,
            body,
          },
        };
        actions.updateLgTemplate(payload);
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
        actions.updateLgFile(payload);
      }, 500),
    [file, projectId]
  );

  const _onChange = useCallback(
    value => {
      setContent(value);
      if (!file) return;
      const { id } = file;
      if (inlineMode) {
        if (!template) return;
        const { name, parameters } = template;
        const { content } = file;
        try {
          const newContent = lgUtil.updateTemplate(content, name, {
            name,
            parameters,
            body: value,
          });
          setDiagnostics(parse(newContent, id, lgImportresolver).diagnostics);
          updateLgTemplate(value);
        } catch (error) {
          setErrorMsg(error.message);
        }
      } else {
        const diags = parse(value, id, lgImportresolver).diagnostics;
        setDiagnostics(diags);
        updateLgFile(value);
      }
    },
    [file, template, projectId]
  );

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    actions.updateUserSettings({ codeEditor: settings });
  };

  const lgOption = {
    projectId,
    fileId: file?.id || dialogId,
    templateId: template?.name,
  };

  return (
    <LgEditor
      hidePlaceholder={inlineMode}
      editorDidMount={editorDidMount}
      value={content}
      errorMessage={errorMsg}
      diagnostics={currentDiagnostics}
      lgOption={lgOption}
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
