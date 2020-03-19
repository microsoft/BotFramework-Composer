// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { LgEditor, EditorDidMount } from '@bfc/code-editor';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { lgIndexer, combineMessage, isValid, filterTemplateDiagnostics } from '@bfc/indexers';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';

import { StoreContext } from '../../store';
import * as lgUtil from '../../utils/lgUtil';

const { check } = lgIndexer;

const lspServerPath = '/lg-language-server';

interface CodeEditorProps extends RouteComponentProps<{}> {
  fileId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = props => {
  const { actions, state, resolvers } = useContext(StoreContext);
  const { lgFiles, projectId } = state;
  const { lgImportresolver } = resolvers;
  const { fileId } = props;
  const file = lgFiles?.find(({ id }) => id === fileId);
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
  }, [fileId, templateId, projectId]);

  useEffect(() => {
    const currentDiagnostics = inlineMode && template ? filterTemplateDiagnostics(diagnostics, template) : diagnostics;

    const isInvalid = !isValid(currentDiagnostics);
    const text = isInvalid ? combineMessage(currentDiagnostics) : '';
    setErrorMsg(text);
  }, [diagnostics]);

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
          setDiagnostics(check(newContent, id, lgImportresolver));
          updateLgTemplate(value);
        } catch (error) {
          setErrorMsg(error.message);
        }
      } else {
        const diags = check(value, id, lgImportresolver);
        setDiagnostics(diags);
        updateLgFile(value);
      }
    },
    [file, template, projectId]
  );

  const lgOption = {
    projectId,
    fileId,
    templateId: template?.name,
  };

  return (
    <LgEditor
      options={{
        lineNumbers: 'on' as 'on',
        minimap: {
          enabled: true,
        },
        lineDecorationsWidth: undefined,
        lineNumbersMinChars: undefined,
      }}
      hidePlaceholder={inlineMode}
      editorDidMount={editorDidMount}
      value={content}
      errorMessage={errorMsg}
      lgOption={lgOption}
      languageServer={{
        path: lspServerPath,
      }}
      onChange={_onChange}
    />
  );
};

export default CodeEditor;
