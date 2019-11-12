// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { PropTypes } from 'prop-types';
import { LGLSPEditor } from '@bfc/code-editor';
import { get, debounce, isEmpty } from 'lodash';

import { StoreContext } from '../../store';
import * as lgUtil from '../../utils/lgUtil';

export default function CodeEditor(props) {
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
      debounce(body => {
        const templateName = get(template, 'Name');
        if (!templateName) return;
        const payload = {
          file,
          templateName,
          template: {
            Name: templateName,
            Body: body,
          },
        };
        actions.updateLgTemplate(payload);
      }, 500),
    [file, template]
  );

  const updateLgFile = useMemo(
    () =>
      debounce(content => {
        const payload = {
          id: fileId,
          content,
        };
        actions.updateLgFile(payload);
      }, 500),
    [fileId]
  );

  const _onChange = value => {
    setContent(value);

    let diagnostics = [];
    if (inlineMode) {
      const content = get(file, 'content', '');
      const templateName = get(template, 'Name');
      const newContent = lgUtil.updateTemplate(content, templateName, {
        Name: templateName,
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

  const lgOption = {
    inline: false,
    content: get(file, 'content', ''),
  };

  if (inlineMode) {
    lgOption.template = template;
    lgOption.inline = true;
  }

  return (
    <LGLSPEditor
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
        url: 'ws://localhost:5002/lgServer',
      }}
      onChange={_onChange}
    />
  );
}

CodeEditor.propTypes = {
  file: PropTypes.object,
  onChange: PropTypes.func,
  template: PropTypes.object,
};
