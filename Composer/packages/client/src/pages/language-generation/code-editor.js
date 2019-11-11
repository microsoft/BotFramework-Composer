// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { LGLSPEditor } from '@bfc/code-editor';
import { get, debounce, isEmpty } from 'lodash';

import * as lgUtil from '../../utils/lgUtil';

export default function CodeEditor(props) {
  const { file, inlineTemplate } = props;
  const onChange = debounce(props.onChange, 500);
  const [diagnostics, setDiagnostics] = useState(get(file, 'diagnostics', []));

  const [content, setContent] = useState('');

  const fileId = file && file.id;
  const inlineMode = !!inlineTemplate;
  useEffect(() => {
    // reset content with file.content's initial state
    if (isEmpty(file)) return;
    const value = inlineTemplate ? get(inlineTemplate, 'Body', '') : get(file, 'content', '');
    setContent(value);
  }, [fileId, inlineTemplate]);

  // local content maybe invalid and should always sync real-time
  // file.content assume to be load from server
  const _onChange = value => {
    setContent(value);
    // onChange(value);
    const diagnostics = lgUtil.check(value);
    setDiagnostics(diagnostics);
  };

  const isInvalid = !lgUtil.isValid(diagnostics);
  const errorMsg = isInvalid ? lgUtil.combineMessage(diagnostics) : '';

  const lgOption = {
    inline: false,
    content: get(file, 'content', ''),
  };

  if (inlineMode) {
    lgOption.template = inlineTemplate;
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
      value={content}
      errorMsg={errorMsg}
      lgOption={lgOption}
      languageServer={{
        url: 'ws://localhost:5000/lgServer',
      }}
      onChange={_onChange}
    />
  );
}

CodeEditor.propTypes = {
  file: PropTypes.object,
  onChange: PropTypes.func,
  inlineTemplate: PropTypes.object,
};
