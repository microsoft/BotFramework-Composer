// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { LgCodeEditor } from './lg/LgCodeEditor';
import { LgResponseEditor } from './lg/LgResponseEditor';
import { LgCodeEditorProps, LgResponseEditorProps } from './types';

export type LgEditorMode = 'codeEditor' | 'responseEditor';

export type LgEditorProps = LgCodeEditorProps &
  LgResponseEditorProps & {
    mode: LgEditorMode;
    codeEditorToolbarHidden?: boolean;
  };

export const LgEditor = (props: LgEditorProps) => {
  const { mode, codeEditorToolbarHidden = false, ...editorProps } = props;

  return mode === 'codeEditor' ? (
    <LgCodeEditor
      toolbarHidden={codeEditorToolbarHidden}
      {...(editorProps as LgCodeEditorProps)}
      options={{ folding: false, ...editorProps.options }}
    />
  ) : (
    <LgResponseEditor {...(editorProps as LgResponseEditorProps)} />
  );
};
