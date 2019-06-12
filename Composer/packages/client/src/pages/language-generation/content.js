/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import lodash from 'lodash';
import { LgEditor } from 'code-editor';

import { contentEditor } from '../language-understanding/styles';

import FormEditor from './form-editor';

// TODO: validate here,
// both form editor and code editor
export default function Content(props) {
  const lgFile = props.file;
  const onChange = props.onChange;
  const textMode = props.textMode;

  return (
    <div css={contentEditor}>
      {lodash.isEmpty(lgFile) === false ? (
        textMode ? (
          <LgEditor value={lgFile.content} onChange={onChange} />
        ) : (
          <FormEditor file={lgFile} onChange={onChange} />
        )
      ) : (
        <Fragment />
      )}
    </div>
  );
}
