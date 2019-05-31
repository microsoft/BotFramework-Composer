/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import lodash from 'lodash';

import CodeEditor from './code-editor';
import FormEditor from './form-editor';

// TODO: validate here,
// both form editor and code editor
export default function Content(props) {
  const lgFile = props.file;
  const onChange = props.onChange;
  const textMode = props.textMode;

  return lodash.isEmpty(lgFile) === false ? (
    textMode ? (
      <CodeEditor file={lgFile} onChange={onChange} />
    ) : (
      <FormEditor file={lgFile} onChange={onChange} />
    )
  ) : (
    <Fragment />
  );
}
