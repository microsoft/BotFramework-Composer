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
    const disposable = monaco.editor.onDidCreateModel(model => {
      const diagnosticOptions: any = {
        validate: true,
      };

      if (schema) {
        const uri = btoa(JSON.stringify(schema));
        const otherSchemas = monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas || [];
        const currentSchema = otherSchemas.find(s => s.uri === uri);

        /**
         * Because we mutate the global language settings, we need to
         * add new schemas / new models to existing schemas.
         * This lets us have multiple editors active using different schemas
         * by taking advantage of the `fileMatch` property + the model's uri.
         */
        diagnosticOptions.schemas = [
          ...otherSchemas.filter(s => s.uri !== uri),
          {
            uri,
            schema,
            fileMatch: [...(currentSchema?.fileMatch || []), model.uri.toString()],
          },
        ];
      }

      monaco.languages.json.jsonDefaults.setDiagnosticsOptions(diagnosticOptions);

      if (disposable) {
        // only do this once per model being created
        disposable.dispose();
      }
    });

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
