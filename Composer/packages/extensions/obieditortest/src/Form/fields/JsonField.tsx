import React, { useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { FieldProps } from 'react-jsonschema-form';
import { Separator, createTheme, ColorClassNames, FontClassNames } from 'office-ui-fabric-react';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';

import './codemirror-fabric.scss';
import './styles.scss';

const fieldHeaderTheme = createTheme({
  fonts: {
    medium: {
      fontSize: '24px',
    },
  },
  palette: {
    neutralLighter: '#d0d0d0',
  },
});

const cmOptions = {
  theme: 'fabric',
  viewportMargin: Infinity,
  mode: {
    name: 'javascript',
    json: true,
    statementIndent: 2,
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
    <div className="JsonField" style={{ margin: '30px 0' }}>
      {(props.uiSchema['ui:title'] || props.schema.title) && (
        <Separator theme={fieldHeaderTheme} alignContent="start" styles={{ content: { paddingLeft: '0' } }}>
          {props.uiSchema['ui:title'] || props.schema.title}
        </Separator>
      )}
      {props.schema.description && (
        <p className={[ColorClassNames.neutralSecondary, FontClassNames.small].join(' ')}>{props.schema.description}</p>
      )}
      <CodeMirror
        value={JSON.stringify(props.formData, null, 2)}
        options={cmOptions}
        className={parseError ? 'CodeMirror--error' : ''}
        onChange={(editor, data, value) => {
          saveValue(value);
        }}
        autoCursor={false}
      />
    </div>
  );
};
