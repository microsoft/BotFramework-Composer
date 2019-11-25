// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { LgEditor, LGOption } from '@bfc/code-editor';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { Diagnostic } from 'botbuilder-lg';
import { LgFile } from '@bfc/shared';

import { StoreContext } from '../../store';
import * as lgUtil from '../../utils/lgUtil';

interface CodeEditorProps {
  file: LgFile;
  template: lgUtil.Template | null;
}

// lsp server port should be same with composer/server port.
const lspServerPort = process.env.NODE_ENV === 'production' ? process.env.PORT || 3000 : 5000;
const lspServerPath = '/lg-language-server';

export default function CodeEditor(props: CodeEditorProps) {
  const { actions } = useContext(StoreContext);
  const { file, template } = props;
  const [diagnostics, setDiagnostics] = useState(get(file, 'diagnostics', []));
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileId = file && file.id;
  const inlineMode = !!template;
  useEffect(() => {
    // reset content with file.content's initial state
    if (isEmpty(file)) return;
    const value = template ? get(template, 'Body', '') : get(file, 'content', '');
    setContent(value);
  }, [fileId, template]);

  useEffect(() => {
    const isInvalid = !lgUtil.isValid(diagnostics);
    const text = isInvalid ? lgUtil.combineMessage(diagnostics) : '';
    setErrorMsg(text);
  }, [diagnostics]);

  const updateLgTemplate = useMemo(
    () =>
      debounce((body: string) => {
        const templateName = get(template, 'Name');
        if (!templateName) return;
        const payload = {
          file,
          templateName,
          template: {
            Name: templateName,
            Parameters: get(template, 'Parameters'),
            Body: body,
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

  const _onChange = value => {
    setContent(value);

    let diagnostics: Diagnostic[] = [];
    if (inlineMode) {
      const content = get(file, 'content', '');
      const templateName = get(template, 'Name', '');
      const newContent = lgUtil.updateTemplate(content, templateName, {
        Name: templateName,
        Parameters: get(template, 'Parameters'),
        Body: value,
      });
      diagnostics = lgUtil.check(newContent);
      updateLgTemplate(value);
    } else {
      diagnostics = lgUtil.check(value);
      updateLgFile(value);
    }
    setDiagnostics(diagnostics);
  };

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
      value={content}
      errorMsg={errorMsg}
      lgOption={lgOption}
      languageServer={{
        port: Number(lspServerPort),
        path: lspServerPath,
      }}
      onChange={_onChange}
    />
  );
}
