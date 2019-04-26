import React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { FieldProps } from 'react-jsonschema-form';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/neat.css';

import './styles.scss';
import { Separator, createTheme, ColorClassNames, FontClassNames } from 'office-ui-fabric-react';

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
  theme: 'neat',
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
};

export const JsonField: React.FC<FieldProps> = props => {
  return (
    <div className="JsonField">
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
        onChange={(editor, data, value) => {
          try {
            props.onChange(JSON.parse(value));
          } catch (err) {
            console.error(err);
          }
        }}
        autoCursor={false}
      />
    </div>
  );
};
