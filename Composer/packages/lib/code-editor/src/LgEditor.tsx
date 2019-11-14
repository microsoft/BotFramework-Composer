// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { startSampleClient, registerLGLanguage } from '@bfc/language-client';

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
  languageServer?:
    | {
        host?: string;
        hostname?: string;
        port?: number;
        path?: string;
      }
    | string;
}

const defaultLGServer = {
  path: '/lgServer',
};

export function LgEditor(props: LGLSPEditorProps) {
  const options = {
    quickSuggestions: true,
    ...props.options,
  };

  const { lgOption = {}, languageServer, ...restProps } = props;
  const lgServer = languageServer || defaultLGServer;
  const editorWillMount = monaco => {
    registerLGLanguage(monaco);
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
