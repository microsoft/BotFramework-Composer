// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useEffect } from 'react';

import * as utils from './utils';
import { BaseEditor, BaseEditorProps, OnInit } from './BaseEditor';

interface JsonEditorProps extends Omit<BaseEditorProps, 'language' | 'value' | 'errorMessage' | 'onChange'> {
  onChange: (jsonData: any) => void;
  value?: object;
  obfuscate?: boolean;
  schema?: any;
}

const JsonEditor: React.FC<JsonEditorProps> = props => {
  const {
    options: additionalOptions,
    value: initialValue,
    onChange,
    obfuscate,
    onInit: onInitProp,
    schema,
    id,
    ...rest
  } = props;
  const [value, setValue] = useState<string>(JSON.stringify(initialValue, null, 2));
  const [parseError, setParseError] = useState<string>('');

  const options = {
    quickSuggestions: true,
    folding: false,
    readOnly: obfuscate,
    ...additionalOptions,
  };

  const onInit: OnInit = monaco => {
    const diagnosticOptions: any = {
      validate: true,
    };

    if (schema) {
      const otherSchemas = monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas || [];
      const uri = btoa(JSON.stringify(schema));
      diagnosticOptions.schemas = [
        ...otherSchemas.filter(s => s.uri !== uri),
        {
          uri,
          schema,
          fileMatch: [uri],
        },
      ];
    }

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions(diagnosticOptions);

    if (typeof onInitProp === 'function') {
      onInitProp(monaco);
    }
  };

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
      id={id}
      helpURL="https://www.json.org"
      language="json"
      options={options}
      value={value}
      onChange={handleChange}
      errorMessage={parseError}
      onInit={onInit}
      {...rest}
    />
  );
};

export { JsonEditor };
