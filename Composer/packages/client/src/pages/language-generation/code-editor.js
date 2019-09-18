/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { LgEditor } from 'code-editor';
import { get, debounce, isEmpty } from 'lodash';

import * as lgUtil from '../../utils/lgUtil';

export default function CodeEditor(props) {
  const { file, codeRange } = props;
  const onChange = debounce(props.onChange, 500);
  const [diagnostics, setDiagnostics] = useState(get(file, 'diagnostics', []));
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
    const diagnostics = lgUtil.check(value);
    setDiagnostics(diagnostics);
    if (lgUtil.isValid(diagnostics) === true) {
      onChange(value);
    }
  };

  const isInvalid = !lgUtil.isValid(diagnostics);
  const errorMsg = isInvalid ? lgUtil.combineMessage(diagnostics) : '';

  return (
    <LgEditor
      options={{
        lineNumbers: 'on',
        minimap: 'on',
      }}
      codeRange={codeRange}
      errorMsg={errorMsg}
      value={content}
      onChange={_onChange}
    />
  );
}

CodeEditor.propTypes = {
  file: PropTypes.object,
  onChange: PropTypes.func,
  codeRange: PropTypes.object,
};
