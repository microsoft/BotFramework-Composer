import React, { useState } from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { RichEditor } from 'code-editor';
import { EditorWillMount } from '@bfcomposer/react-monaco-editor';

import './styles.css';

import { BaseField } from './BaseField';

export const JsonField: React.FC<FieldProps> = props => {
  const [value, setValue] = useState<string>(JSON.stringify(props.formData, null, 2));
  const [parseError, setParseError] = useState<string>('');

  const handleChange = value => {
    setValue(value);
    try {
      const data = JSON.parse(value);
      props.onChange(data);
      setParseError('');
    } catch (err) {
      setParseError('invalid json');
    }
  };

  const handleMount: EditorWillMount = monaco => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
    });
  };

  return (
    <BaseField {...props} className="JsonField">
      <div style={{ height: '315px' }}>
        <RichEditor
          language="json"
          onChange={handleChange}
          errorMsg={parseError}
          editorWillMount={handleMount}
          options={{ folding: false }}
          value={value}
          helpURL="https://www.json.org"
        />
      </div>
    </BaseField>
  );
};
