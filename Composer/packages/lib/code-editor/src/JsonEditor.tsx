// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useEffect } from 'react';
import { editor } from '@bfcomposer/monaco-editor';
import { monaco } from '@monaco-editor/react';

import * as utils from './utils';
import { BaseEditor, BaseEditorProps } from './BaseEditor';

interface JsonEditorProps extends Omit<BaseEditorProps, 'language' | 'value' | 'errorMessage' | 'onChange'> {
  onChange: (jsonData: any) => void;
  value?: object;
  obfuscate?: boolean;
}

const JsonEditor: React.FC<JsonEditorProps> = props => {
  const { options: additionalOptions, value: initialValue, onChange, obfuscate, ...rest } = props;
  const [value, setValue] = useState<string>(JSON.stringify(initialValue, null, 2));
  const [parseError, setParseError] = useState<string>('');

  const options: editor.IEditorConstructionOptions = {
    quickSuggestions: true,
    folding: false,
    readOnly: obfuscate,
    ...additionalOptions,
  };

  useEffect(() => {
    monaco.init().then(instance => {
      instance.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
      });
    });
  }, []);

  useEffect(() => {
    const result = obfuscate ? utils.obfuscate(initialValue) : initialValue;
    setValue(JSON.stringify(result, null, 2));
  }, [obfuscate]);

  const handleChange = value => {
    setValue(value);

    if (value) {
      try {
        const data = JSON.parse(value);
        onChange(data);
        setParseError('');
      } catch (err) {
        setParseError('Invalid json');
      }
    } else {
      onChange(undefined);
      setParseError('');
    }
  };

  return (
    <BaseEditor
      helpURL="https://www.json.org"
      language="json"
      options={options}
      value={value}
      onChange={handleChange}
      errorMessage={parseError}
      {...rest}
    />
  );
};

export { JsonEditor };
