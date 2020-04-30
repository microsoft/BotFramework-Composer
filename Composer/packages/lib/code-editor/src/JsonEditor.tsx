// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useEffect, useState } from 'react';
import merge from 'lodash/merge';
import schemaDefaults from 'json-schema-defaults';

import { BaseEditor, BaseEditorProps, OnInit } from './BaseEditor';

interface JsonEditorProps extends Omit<BaseEditorProps, 'language' | 'value' | 'errorMessage' | 'onChange'> {
  onChange: (jsonData: any) => void;
  value?: object;
  schema?: any;
  onError?: (error: string) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = props => {
  const {
    options: additionalOptions,
    value: initialValue,
    onChange,
    onInit: onInitProp,
    onError,
    schema,
    id,
    ...rest
  } = props;

  const [parseError, setParseError] = useState<string>('');
  const options = {
    quickSuggestions: true,
    folding: false,
    readOnly: false,
    ...additionalOptions,
  };

  useEffect(() => {
    onError && onError(parseError);
  }, [parseError]);

  const onInit: OnInit = monaco => {
    const disposable = monaco.editor.onDidCreateModel(model => {
      const diagnosticOptions: any = {
        validate: true,
        enableSchemaRequest: true,
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

  const handleChange = value => {
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

  const json = schema ? merge({}, schemaDefaults(schema), initialValue) : initialValue;

  return (
    <BaseEditor
      id={id}
      helpURL="https://www.json.org"
      language="json"
      options={options}
      value={JSON.stringify(json, null, 2)}
      onChange={handleChange}
      errorMessage={parseError}
      onInit={onInit}
      {...rest}
    />
  );
};

export { JsonEditor };
