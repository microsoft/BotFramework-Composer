// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { LuEditor } from '@bfc/code-editor';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { combineMessage, isValid } from '@bfc/indexers';

export default function CodeEditor(props) {
  const { file, errorMsg: updateErrorMsg } = props;
  const onChange = debounce(props.onChange, 500);
  const diagnostics = get(file, 'diagnostics', []);
  const [content, setContent] = useState(get(file, 'content', ''));

  const fileId = file && file.id;
  useEffect(() => {
    // reset content with file.content's initial state
    if (isEmpty(file)) return;
    setContent(file.content);
  }, [fileId]);

  // local content maybe invalid and should always sync real-time
  // file.content assume to be load from server
  const _onChange = value => {
    setContent(value);
    // TODO: validate before request update server like lg, when luParser is ready
    onChange(value);
  };

  // diagnostics is load file error,
  // updateErrorMsg is save file return error.
  const isInvalid = !isValid(file.diagnostics) || updateErrorMsg !== '';
  const errorMsg = isInvalid ? `${combineMessage(diagnostics)}\n ${updateErrorMsg}` : '';

  return (
    <LuEditor
      options={{
        lineNumbers: 'on',
        minimap: 'on',
        lineDecorationsWidth: undefined,
        lineNumbersMinChars: false,
      }}
      errorMsg={errorMsg}
      value={content}
      onChange={_onChange}
    />
  );
}

CodeEditor.propTypes = {
  file: PropTypes.object,
  onChange: PropTypes.func,
  errorMsg: PropTypes.string,
};
