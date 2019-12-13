// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { LgEditor, LGOption } from '@bfc/code-editor';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { editor } from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';
import { lgIndexer, Diagnostic } from '@bfc/indexers';
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../store';
import * as lgUtil from '../../utils/lgUtil';

const { check, isValid, combineMessage } = lgIndexer;

const lspServerPath = '/lg-language-server';

interface CodeEditorProps extends RouteComponentProps<{}> {
  fileId?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = props => {
  const { actions, state } = useContext(StoreContext);
  const { lgFiles } = state;
  const file = lgFiles.length ? lgFiles[0] : null;
  const [diagnostics, setDiagnostics] = useState(get(file, 'diagnostics', []));
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lgEditor, setLgEditor] = useState<editor.IStandaloneCodeEditor | null>(null);

  const search = props.location ? props.location.search : '';
  const templateMatched = /^\?t=([-\w]+)/.exec(search);
  const templateId = templateMatched ? decodeURIComponent(templateMatched[1]) : undefined;
  const template = templateId && file ? file.templates.find(({ name }) => name === templateId) : undefined;

  const hash = props.location ? props.location.hash : '';
  const lineMatched = /L(\d+)/g.exec(hash);
  const line = lineMatched ? +lineMatched[1] : undefined;

  const fileId = (file && file.id) || 'common';
  const inlineMode = !!template;

  useEffect(() => {
    // reset content with file.content's initial state
    if (isEmpty(file)) return;
    const value = template ? get(template, 'body', '') : get(file, 'content', '');
    setContent(value);
  }, [fileId, templateId]);

  useEffect(() => {
    const currentDiagnostics =
      inlineMode && template
        ? diagnostics.filter(d => {
            return (
              d.range &&
              d.range.start.line >= template.range.startLineNumber &&
              d.range.end.line <= template.range.endLineNumber
            );
          })
        : diagnostics;

    const isInvalid = !isValid(currentDiagnostics);
    const text = isInvalid ? combineMessage(currentDiagnostics) : '';
    setErrorMsg(text);
  }, [diagnostics]);

  const editorDidMount = useCallback((lgEditor: editor.IStandaloneCodeEditor) => {
    setLgEditor(lgEditor);
  }, []);

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
        const templateName = get(template, 'name');
        if (!templateName) return;
        const payload = {
          file,
          templateName,
          template: {
            name: templateName,
            parameters: get(template, 'parameters'),
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
        const payload = {
          id: fileId,
          content,
        };
        actions.updateLgFile(payload);
      }, 500),
    [file]
  );

  const _onChange = useCallback(
    value => {
      setContent(value);

      let diagnostics: Diagnostic[] = [];
      if (inlineMode) {
        const content = get(file, 'content', '');
        const templateName = get(template, 'name', '');
        try {
          const newContent = lgUtil.updateTemplate(content, templateName, {
            name: templateName,
            parameters: get(template, 'parameters'),
            body: value,
          });
          diagnostics = check(newContent, fileId);
          updateLgTemplate(value);
        } catch (error) {
          setErrorMsg(error.message);
        }
      } else {
        diagnostics = check(value, fileId);
        updateLgFile(value);
      }
      setDiagnostics(diagnostics);
    },
    [file, template]
  );

  const lgOption: LGOption = {
    inline: inlineMode,
    content: get(file, 'content', ''),
    template,
  };

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
