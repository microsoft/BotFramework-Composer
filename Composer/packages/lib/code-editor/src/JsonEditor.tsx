// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { editor } from '@bfcomposer/monaco-editor';
import { EditorWillMount } from '@bfcomposer/react-monaco-editor';

import { RichEditor, RichEditorProps } from './RichEditor';

interface JsonEditorProps extends Omit<RichEditorProps, 'language' | 'value' | 'errorMsg' | 'onChange'> {
  onChange: (jsonData: any) => void;
  value?: object;
}

export function JsonEditor(props: JsonEditorProps) {
  const { options: additionalOptions, value: initialValue, onChange, editorWillMount, ...rest } = props;
  const [value, setValue] = useState<string>(JSON.stringify(initialValue, null, 2));
  const [parseError, setParseError] = useState<string>('');

  const options: editor.IEditorConstructionOptions = {
    quickSuggestions: true,
    folding: false,
    ...additionalOptions,
  };

  useEffect(() => {
    const str = JSON.stringify(initialValue, null, 2);
    if (str !== value) {
      setValue(str);
    }
  }, [initialValue]);

  const handleChange = value => {
    setValue(value);
    try {
      const data = JSON.parse(value);
      onChange(data);
      setParseError('');
    } catch (err) {
      setParseError('invalid json');
    }
  };

  const handleMount: EditorWillMount = monaco => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
    });

    if (typeof editorWillMount === 'function') {
      editorWillMount(monaco);
    }
  };

  return (
    <RichEditor
      helpURL="https://www.json.org"
      language="json"
      options={options}
      value={value}
      onChange={handleChange}
      editorWillMount={handleMount}
      errorMsg={parseError}
      {...rest}
    />
  );
}
