// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { LuEditor } from '@bfc/code-editor';
import debounce from 'lodash/debounce';
import { LuIntentSection } from '@bfc/shared';
import { LuFile, filterSectionDiagnostics } from '@bfc/indexers';

import { FormContext } from '../types';

interface LuEditorWidgetProps {
  formContext: FormContext;
  name: string;
  height?: number | string;
  onChange: (template?: string) => void;
}

export class LuEditorWidget extends React.Component<LuEditorWidgetProps> {
  constructor(props) {
    super(props);
    this.debounceUpdate = debounce(this.updateLuIntent, 500);
    this.name = this.props.name;
    this.formContext = this.props.formContext;
    this.luFileId = this.formContext.currentDialog.id;
    this.luFile = this.formContext.luFiles.find(f => f.id === this.luFileId);
    this.luIntent = (this.luFile && this.luFile.intents.find(intent => intent.Name === this.name)) || {
      Name: this.name,
      Body: '',
    };
  }

  formContext: FormContext;
  name: string;
  luFileId: string;
  luFile: LuFile | null;
  luIntent: LuIntentSection;
  state = { localValue: '' };
  debounceUpdate;
  updateLuIntent = (body: string) => {
    this.formContext.shellApi.updateLuIntent(this.luFileId, this.name, { Name: this.name, Body: body }).catch(() => {});
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const name = nextProps.name;
    const formContext = nextProps.formContext;
    const luFileId = formContext.currentDialog.id;
    const luFile = formContext.luFiles.find(f => f.id === luFileId);
    const luIntent = (luFile && luFile.intents.find(intent => intent.Name === name)) || {
      Name: name,
      Body: '',
    };
    if (!prevState.localValue) {
      return {
        localValue: luIntent.Body,
      };
    }
    return null;
  }

  onChange = (body: string) => {
    this.setState({
      localValue: body,
    });
    if (this.luFileId) {
      if (body) {
        this.updateLuIntent(body);
      } else {
        this.formContext.shellApi.removeLuIntent(this.luFileId, this.name);
      }
    }
  };
  render() {
    const diagnostic = this.luFile && filterSectionDiagnostics(this.luFile.diagnostics, this.luIntent)[0];

    const errorMsg = diagnostic
      ? diagnostic.message.split('error message: ')[diagnostic.message.split('error message: ').length - 1]
      : '';
    const luOption = {
      fileId: this.luFileId,
      sectionId: this.luIntent?.Name,
    };
    const height = this.props.height || 250;

    return (
      <LuEditor
        onChange={this.onChange}
        value={this.state.localValue}
        errorMsg={errorMsg}
        hidePlaceholder={true}
        luOption={luOption}
        options={{
          lineNumbers: 'off',
          minimap: {
            enabled: false,
          },
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 0,
          glyphMargin: false,
          folding: false,
          renderLineHighlight: 'none',
        }}
        height={height}
      />
    );
  }
}
