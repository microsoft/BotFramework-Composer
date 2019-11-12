// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { startSampleClient, registerLGLanguage } from '@bfc/language-client';
// import { startSampleClient, registerLGLanguage } from '../../../../tools/language-client/src/';

import { assignDefined } from '../utils';

import { RichEditor, RichEditorProps } from './RichEditor';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';
const placeholder = `> To learn more about the LG file format, read the documentation at
> ${LG_HELP}`;

export interface LGOption {
  inline: boolean;
  content: string;
  template: {
    Name: string;
    Body: string;
  };
}

export interface LGLSPEditorProps extends RichEditorProps {
  lgOption?: LGOption;
  languageServer?: {
    url: string;
  };
}

const defaultLGServer = {
  url: 'ws://localhost:5000/lgServer',
};

export function LGLSPEditor(props: LGLSPEditorProps) {
  const options = {
    quickSuggestions: true,
    ...props.options,
  };

  const { lgOption = {}, languageServer = {}, ...restProps } = props;
  const lgServer = assignDefined(defaultLGServer, languageServer);
  const editorWillMount = monaco => {
    registerLGLanguage();
    if (typeof props.editorWillMount === 'function') {
      return props.editorWillMount(monaco);
    }
  };
  const editorDidMount = (editor, monaco) => {
    startSampleClient(editor, lgServer, lgOption);
    if (typeof props.editorDidMount === 'function') {
      return props.editorDidMount(editor, monaco);
    }
  };

  return (
    <RichEditor
      placeholder={placeholder}
      helpURL={LG_HELP}
      {...restProps}
      theme={'lgtheme'}
      language={'botbuilderlg'}
      options={options}
      editorWillMount={editorWillMount}
      editorDidMount={editorDidMount}
    />
  );
}
