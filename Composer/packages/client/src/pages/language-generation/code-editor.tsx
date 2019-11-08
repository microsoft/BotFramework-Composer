// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react';
import { LgEditor } from '@bfc/code-editor';
import get from 'lodash.get';
import debounce from 'lodash.debounce';
import isEmpty from 'lodash.isempty';
import { CodeRange } from '@bfc/shared';

import * as lgUtil from '../../utils/lgUtil';

interface CodeEditorProps {
  file: object;
  onChange: (value: string) => void;
  codeRange: Partial<CodeRange>;
}

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
    onChange(value);
    const diagnostics = lgUtil.check(value);
    setDiagnostics(diagnostics);
  };

  const isInvalid = !lgUtil.isValid(diagnostics);
  const errorMsg = isInvalid ? lgUtil.combineMessage(diagnostics) : '';

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
      codeRange={codeRange}
      errorMsg={errorMsg}
      value={content}
      onChange={_onChange}
    />
  );
}
