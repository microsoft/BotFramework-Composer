/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import lodash from 'lodash';
import CodeEditor from 'composer-libs/code-editor';

import { contentEditor } from '../language-understanding/styles';

import FormEditor from './form-editor';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';
const placeholder = `> To learn more about the LG file format, read the documentation at
> ${LG_HELP}`;

// TODO: validate here,
// both form editor and code editor
export default function Content(props) {
  const lgFile = props.file;
  const onChange = props.onChange;
  const textMode = props.textMode;

  return lodash.isEmpty(lgFile) === false ? (
    textMode ? (
      <div css={contentEditor}>
        <CodeEditor value={lgFile.content} onChange={onChange} placeholder={placeholder} />
      </div>
    ) : (
      <FormEditor file={lgFile} onChange={onChange} />
    )
  ) : (
    <Fragment />
  );
}
