// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import {
  startSampleClient,
  registerLGLanguage,
} from '../../../../tools/language-servers/language-generation/src/startSampleClient';

import { RichEditor, RichEditorProps } from './RichEditor';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';
const placeholder = `> To learn more about the LG file format, read the documentation at
> ${LG_HELP}`;

export function LGLSPEditor(props: RichEditorProps) {
  const options = {
    quickSuggestions: true,
    ...props.options,
  };

  const editorWillMount = monaco => {
    registerLGLanguage();
    if (typeof props.editorWillMount === 'function') {
      return props.editorWillMount(monaco);
    }
  };
  const editorDidMount = (editor, monaco) => {
    // window.editor = editor;
    startSampleClient(editor, {});
    if (typeof props.editorDidMount === 'function') {
      return props.editorDidMount(editor, monaco);
    }
  };

  return (
    <RichEditor
      placeholder={placeholder}
      helpURL={LG_HELP}
      {...props}
      theme={'lgtheme'}
      language={'botbuilderlg'}
      options={options}
      editorWillMount={editorWillMount}
      editorDidMount={editorDidMount}
    />
  );
}
