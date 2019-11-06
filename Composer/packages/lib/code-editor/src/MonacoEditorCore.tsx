// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as monaco from 'monaco-editor-core';
import React from 'react';
// import { startSampleClient, registerLGLanguage } from '@bfc/lg-lsp/lib/startSampleClient';

import { MonacoEditorCoreProps } from './interface';
import { noop, processSize, assignDefined } from './utils';

const defaultProps: MonacoEditorCoreProps = {
  width: '100%',
  height: '100%',
  value: null,
  defaultValue: '',
  language: 'javascript',
  theme: 'vs',
  options: {},
  overrideServices: {},
  editorDidMount: noop,
  editorWillMount: noop,
  onChange: noop,
};

export class MonacoEditorCore extends React.Component<MonacoEditorCoreProps> {
  public static defaultProps: MonacoEditorCoreProps = defaultProps;
  private containerElement: HTMLElement | undefined;
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private __preventTriggerChangeEvent = false;
  private _subscription;
  constructor(props, defaultProps) {
    super(props, defaultProps);
  }

  componentDidMount() {
    this.initMonaco();
  }

  componentDidUpdate(prevProps) {
    const props = assignDefined({}, defaultProps, this.props);
    const { value, language, theme, height, options, width } = props;

    const { editor } = this;
    if (!editor) return;
    const model = editor.getModel();
    if (model === null) return;
    if (value != null && value !== model.getValue()) {
      this.__preventTriggerChangeEvent = true;
      editor.pushUndoStop();
      model.pushEditOperations(
        [],
        [
          {
            range: model.getFullModelRange(),
            text: value,
          },
        ],
        () => null
      );
      editor.pushUndoStop();
      this.__preventTriggerChangeEvent = false;
    }
    if (prevProps.language !== language) {
      monaco.editor.setModelLanguage(model, language);
    }
    if (prevProps.theme !== theme) {
      monaco.editor.setTheme(theme);
    }
    if (editor && (width !== prevProps.width || height !== prevProps.height)) {
      editor.layout();
    }
    if (prevProps.options !== options) {
      editor.updateOptions(options);
    }
  }

  componentWillUnmount() {
    this.destroyMonaco();
  }

  assignRef = component => {
    this.containerElement = component;
  };

  destroyMonaco() {
    if (this.editor) {
      const model = this.editor.getModel();
      if (model) model.dispose();
      this.editor.dispose();
    }
    if (this._subscription) {
      this._subscription.dispose();
    }
  }

  initMonaco() {
    const value = this.props.value != null ? this.props.value : this.props.defaultValue;
    const { language, theme, options, overrideServices } = this.props;
    if (this.containerElement) {
      // Before initializing monaco editor
      assignDefined(options, this.editorWillMount());
      // this.editor = startSampleClient(this.containerElement, {});

      this.editor = monaco.editor.create(
        this.containerElement,
        {
          value,
          language,
          ...options,
          ...(theme ? { theme } : {}),
        },
        overrideServices
      );
      // After initializing monaco editor
      this.editorDidMount(this.editor, monaco);
    }
  }

  editorWillMount() {
    const { editorWillMount = noop } = this.props;
    const options = editorWillMount(monaco);
    return options || {};
  }

  editorDidMount(editor, monaco) {
    const { editorDidMount = noop, onChange = noop } = this.props;
    editorDidMount(editor, monaco);

    this._subscription = editor.onDidChangeModelContent(e => {
      if (!this.__preventTriggerChangeEvent) {
        onChange(editor.getValue(), e);
      }
    });
  }

  render() {
    const { width, height } = this.props;
    const fixedWidth = processSize(width);
    const fixedHeight = processSize(height);
    const style = {
      width: fixedWidth,
      height: fixedHeight,
    };

    return <div ref={this.assignRef} style={style} className="monaco-editor-core-container" />;
  }
}
