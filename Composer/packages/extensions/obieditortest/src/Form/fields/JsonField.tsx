import React, { useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';

import './codemirror-fabric.scss';
import './styles.scss';
import { BaseField } from './BaseField';

const cmOptions = {
  theme: 'fabric',
  viewportMargin: Infinity,
  mode: {
    name: 'javascript',
    json: true,
  },
  lineNumbers: true,
  lineWrapping: true,
  indentWithTabs: false,
  tabSize: 2,
  smartIndent: true,
  height: 'auto',
};

export const JsonField: React.FC<FieldProps> = props => {
  const [parseError, setParseError] = useState(false);

  const saveValue = value => {
    try {
      const data = JSON.parse(value);
      props.onChange(data);
      setParseError(false);
    } catch (err) {
      setParseError(true);
    }
  };

  return (
    <BaseField {...props} className="JsonField">
      <CodeMirror
        value={JSON.stringify(props.formData, null, 2)}
        options={cmOptions}
        className={parseError ? 'CodeMirror--error' : ''}
        onChange={(editor, data, value) => {
          saveValue(value);
        }}
        autoCursor={false}
      />
    </BaseField>
  );
};
