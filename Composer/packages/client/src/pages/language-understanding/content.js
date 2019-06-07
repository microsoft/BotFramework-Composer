/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import lodash from 'lodash';
import { LuEditor } from 'code-editor';

import FormEditor from './form-editor';
import { contentEditor } from './styles';

export default function Content(props) {
  const luFile = props.file;
  const onChange = props.onChange;
  const textMode = props.textMode;

  return lodash.isEmpty(luFile) === false ? (
    textMode ? (
      <div css={contentEditor}>
        <LuEditor value={luFile.content} onChange={onChange} />
      </div>
    ) : (
      <FormEditor file={luFile} onChange={onChange} />
    )
  ) : (
    <Fragment />
  );
}
