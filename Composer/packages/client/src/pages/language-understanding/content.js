/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import lodash from 'lodash';

import CodeEditor from './code-editor';
import FormEditor from './form-editor';

export default function Content(props) {
  const luFile = props.file;
  const onChange = props.onChange;
  const textMode = props.textMode;

  return lodash.isEmpty(luFile) === false ? (
    textMode ? (
      <CodeEditor file={luFile} onChange={onChange} />
    ) : (
      <FormEditor file={luFile} onChange={onChange} />
    )
  ) : (
    <Fragment />
  );
}
