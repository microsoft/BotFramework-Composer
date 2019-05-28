/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import MonacoEditor from 'react-monaco-editor';

import { contentEditor, codeEditor } from '../language-understanding/styles';

const codePlaceHolder = `/*
some copy on how to create your .lu file

Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 Ut enim ad minim veniam,

*/`;

export default function CodeEditor(props) {
  const luFile = props.file;

  return luFile ? (
    <div css={contentEditor}>
      <div css={codeEditor}>
        <MonacoEditor
          height="400"
          language="markdown"
          theme="vs"
          value={luFile.content || codePlaceHolder}
          onChange={props.onChange}
        />
      </div>
    </div>
  ) : (
    <Fragment />
  );
}
