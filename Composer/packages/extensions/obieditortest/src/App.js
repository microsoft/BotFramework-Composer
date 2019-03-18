import React, { useState, useEffect } from 'react';

import Form from './Form';
import { masterSchema } from './appschema';

import './App.css';

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
    property: {
      'ui:options': {
        span: 2,
      },
    },
    pattern: {
      'ui:options': {
        span: 2,
      },
    },
  },
  'Microsoft.SendActivityTemplateStep': {
    ...hideMetaData,
  },
  'Microsoft.IntegerPrompt': {
    ...hideMetaData,
    minValue: {
      'ui:options': {
        span: 2,
      },
    },
    maxValue: {
      'ui:options': {
        span: 2,
      },
    },
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
  const type = getType(props.data);

  const [dialogSchema, setDialogSchema] = useState({
    definitions: { ...masterSchema.definitions },
    ...masterSchema.definitions[type],
  });
  const [dialogUiSchema] = useState({ ...uiSchema[type] });

  const onChange = newValue => {
    props.onChange(newValue.formData);
  };

  useEffect(() => {
    const type = getType(props.data);
    setDialogSchema({
      ...dialogSchema,
      ...masterSchema.definitions[type],
    });
  }, [type]);

  return (
    <div className="App" style={{ margin: '15px 15px 15px 15px' }}>
      <Form
        noValidate
        className="schemaForm"
        onChange={onChange}
        formData={props.data.dialog || props.data}
        schema={dialogSchema}
        uiSchema={dialogUiSchema}
      />
    </div>
  );
};

export default FormEditor;
