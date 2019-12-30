// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { LgEditor } from '@bfc/code-editor';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { editor } from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';
import { lgIndexer, combineMessage, isValid } from '@bfc/indexers';
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
  const { actions, state } = useContext(StoreContext);
  const { lgFiles } = state;
  const { fileId } = props;
  const file = lgFiles?.find(({ id }) => id === 'common');
  const [diagnostics, setDiagnostics] = useState(get(file, 'diagnostics', []));
  const [errorMsg, setErrorMsg] = useState('');
  const [lgEditor, setLgEditor] = useState<editor.IStandaloneCodeEditor | null>(null);

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
  const line = Array.isArray(hashLine) ? +hashLine[0] : typeof hashLine === 'string' ? +hashLine : undefined;

  const inlineMode = !!template;
  const [content, setContent] = useState(template?.body || file?.content);

  useEffect(() => {
    // reset content with file.content's initial state
    if (!file || isEmpty(file)) return;
    const value = template ? template.body : file.content;
    setContent(value);
  }, [fileId, templateId]);

  useEffect(() => {
    const currentDiagnostics =
      inlineMode && template
        ? diagnostics.filter(d => {
            return (
              d.range &&
              template.range &&
              d.range.start.line >= template.range.startLineNumber &&
              d.range.end.line <= template.range.endLineNumber
            );
          })
        : diagnostics;

    const isInvalid = !isValid(currentDiagnostics);
    const text = isInvalid ? combineMessage(currentDiagnostics) : '';
    setErrorMsg(text);
  }, [diagnostics]);

  const editorDidMount = (lgEditor: editor.IStandaloneCodeEditor) => {
    setLgEditor(lgEditor);
  };

  useEffect(() => {
    if (lgEditor && line !== undefined) {
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
          templateName: name,
          template: {
            name,
            parameters,
            body,
          },
        };
        actions.updateLgTemplate(payload);
      }, 500),
    [file, template]
  );

  const updateLgFile = useMemo(
    () =>
      debounce((content: string) => {
        if (!file) return;
        const { id } = file;
        const payload = {
          id,
          content,
        };
        actions.updateLgFile(payload);
      }, 500),
    [file]
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
          setDiagnostics(check(newContent, id));
          updateLgTemplate(value);
        } catch (error) {
          setErrorMsg(error.message);
        }
      } else {
        setDiagnostics(check(value, id));
        updateLgFile(value);
      }
    },
    [file, template]
  );

  const lgOption = template
    ? {
        inline: inlineMode,
        content: file?.content ?? '',
        template,
      }
    : undefined;

  return (
    <LgEditor
      // typescript is unable to reconcile 'on' as part of a union type
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      options={{
        lineNumbers: 'on',
        minimap: 'on',
        lineDecorationsWidth: undefined,
        lineNumbersMinChars: false,
      }}
      hidePlaceholder={inlineMode}
      editorDidMount={editorDidMount}
      value={content}
      errorMsg={errorMsg}
      lgOption={lgOption}
      languageServer={{
        path: lspServerPath,
      }}
      onChange={_onChange}
    />
  );
};

export default CodeEditor;
