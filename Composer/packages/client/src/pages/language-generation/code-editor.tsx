// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { LgEditor, LGOption } from '@bfc/code-editor';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { LgFile } from '@bfc/indexers';
import { editor } from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';
import { lgIndexer, Diagnostic, combineMessage, isValid } from '@bfc/indexers';

import { StoreContext } from '../../store';
import * as lgUtil from '../../utils/lgUtil';

const { check } = lgIndexer;

interface CodeEditorProps {
  file: LgFile;
  template: lgUtil.Template | null;
  line: number;
}

const lspServerPath = '/lg-language-server';

export default function CodeEditor(props: CodeEditorProps) {
  const { actions } = useContext(StoreContext);
  const { file, template, line } = props;
  const [diagnostics, setDiagnostics] = useState(get(file, 'diagnostics', []));
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lgEditor, setLgEditor] = useState<editor.IStandaloneCodeEditor | null>(null);

  const fileId = file && file.id;
  const inlineMode = !!template;
  useEffect(() => {
    // reset content with file.content's initial state
    if (isEmpty(file)) return;
    const value = template ? get(template, 'body', '') : get(file, 'content', '');
    setContent(value);
  }, [fileId, template]);

  useEffect(() => {
    const isInvalid = !isValid(diagnostics);
    const text = isInvalid ? combineMessage(diagnostics) : '';
    setErrorMsg(text);
  }, [diagnostics]);

  useEffect(() => {
    if (lgEditor) {
      lgEditor.revealLine(line);
    }
  }, [lgEditor]);

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
          id: file.id,
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
    template: template ? template : undefined,
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
      editorDidMount={setLgEditor}
      value={content}
      errorMsg={errorMsg}
      lgOption={lgOption}
      languageServer={{
        path: lspServerPath,
      }}
      onChange={_onChange}
    />
  );
}
