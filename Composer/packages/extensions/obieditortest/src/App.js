import React, { useState } from 'react';
import './App.css';
import Form from 'react-jsonschema-form';

import { masterSchema } from './appschema';

const hideMetaData = {
  $ref: {
    'ui:widget': 'hidden',
  },
  $id: {
    'ui:widget': 'hidden',
  },
  $type: {
    'ui:widget': 'hidden',
  },
};

const uiSchema = {
  'Microsoft.TextPrompt': {
    ...hideMetaData,
  },
  'Microsoft.SendActivityTemplateStep': {
    ...hideMetaData,
  },
  'Microsoft.IntegerPrompt': {
    ...hideMetaData,
  },
  'Microsoft.EndDialog': {
    ...hideMetaData,
  },
};

const getType = data => {
  if (data.dialog) {
    if (data.dialog.$type) {
      return data.dialog.$type;
    }
  } else {
    return data.$type;
  }
};

export const FormEditor = props => {
  const [dialogSchema] = useState({
    definitions: { ...masterSchema.definitions },
    ...masterSchema.definitions[getType(props.data)],
  });

  const [dialogUiSchema] = useState({ ...uiSchema[getType(props.data)] });

  const onChange = newValue => {
    props.onChange(newValue.formData);
  };

  return (
    <div className="App" style={{ margin: '15px 15px 15px 15px' }}>
      <Form
        noValidate
        className="schemaForm"
        onChange={onChange}
        formData={props.data.dialog}
        schema={dialogSchema}
        uiSchema={dialogUiSchema}
      />
    </div>
  );
};

export default FormEditor;
