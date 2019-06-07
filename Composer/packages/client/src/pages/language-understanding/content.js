/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import lodash from 'lodash';
import CodeEditor from 'code-editor';

import FormEditor from './form-editor';
import { contentEditor } from './styles';

const LU_HELP =
  'https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md#lu-file-format';
const placeholder = `>To learn more about the LU file format, read the documentation at
> ${LU_HELP}`;

export default function Content(props) {
  const luFile = props.file;
  const onChange = props.onChange;
  const textMode = props.textMode;

  return lodash.isEmpty(luFile) === false ? (
    textMode ? (
      <div css={contentEditor}>
        <CodeEditor value={luFile.content} onChange={onChange} placeholder={placeholder} />
      </div>
    ) : (
      <FormEditor file={luFile} onChange={onChange} />
    )
  ) : (
    <Fragment />
  );
}
