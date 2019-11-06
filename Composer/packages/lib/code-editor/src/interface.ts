// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import * as monacoEditor from 'monaco-editor-core';

export type ChangeHandler = (value: string, event: monacoEditor.editor.IModelContentChangedEvent) => void;

export type EditorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => void;

export type EditorWillMount = (monaco: typeof monacoEditor) => void | monacoEditor.editor.IEditorConstructionOptions;

declare interface MonacoEditorCoreBaseProps {
  /**
   * Width of editor. Defaults to 100%.
   */
  width?: string | number;

  /**
   * Height of editor. Defaults to 500.
   */
  height?: string | number;

  /**
   * The initial value of the auto created model in the editor.
   */
  defaultValue?: string;

  /**
   * The initial language of the auto created model in the editor. Defaults to 'javascript'.
   */
  language?: string;

  /**
   * Theme to be used for rendering.
   * The current out-of-the-box available themes are: 'vs' (default), 'vs-dark', 'hc-black'.
   * You can create custom themes via `monaco.editor.defineTheme`.
   */
  theme?: string | null;

  /**
   * Optional, allow to pass a different context then the global window onto which the monaco instance will be loaded. Useful if you want to load the editor in an iframe.
   */
  context?: any;
}

export interface MonacoEditorCoreProps extends MonacoEditorCoreBaseProps {
  /**
   * Value of the auto created model in the editor.
   * If you specify `null` or `undefined` for this property, the component behaves in uncontrolled mode.
   * Otherwise, it behaves in controlled mode.
   */
  value?: string | null;

  /**
   * Refer to Monaco interface {monaco.editor.IEditorConstructionOptions}.
   */
  options?: monacoEditor.editor.IEditorConstructionOptions;

  /**
   * Refer to Monaco interface {monaco.editor.IEditorOverrideServices}.
   */
  overrideServices?: monacoEditor.editor.IEditorOverrideServices;

  /**
   * An event emitted when the editor has been mounted (similar to componentDidMount of React).
   */
  editorDidMount?: EditorDidMount;

  /**
   * An event emitted before the editor mounted (similar to componentWillMount of React).
   */
  editorWillMount?: EditorWillMount;

  /**
   * An event emitted when the content of the current model has changed.
   */
  onChange?: ChangeHandler;
}

export default class MonacoEditorCore extends React.Component<MonacoEditorCoreProps> {
  editor?: monacoEditor.editor.IStandaloneCodeEditor;
}
