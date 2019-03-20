import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Customizer } from 'office-ui-fabric-react';
import { FluentCustomizations } from '@uifabric/fluent-theme';

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
  'Microsoft.DateTimePrompt': {
    ...hideMetaData,
    minValue: {
      'ui:widget': 'datetime',
    },
    maxValue: {
      'ui:widget': 'datetime',
    },
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
  const [dialogUiSchema, setDialogUiSchema] = useState({ ...uiSchema[type] });

  const onChange = newValue => {
    props.onChange(newValue.formData);
  };

  useEffect(() => {
    const type = getType(props.data);
    setDialogSchema({
      definitions: { ...masterSchema.definitions },
      ...masterSchema.definitions[type],
    });
    setDialogUiSchema({ ...uiSchema[type] });
  }, [type]);

  return (
    <Customizer {...FluentCustomizations}>
      <div className="App" style={{ margin: '15px 15px 15px 15px' }}>
        <Form
          noValidate
          className="schemaForm"
          onChange={onChange}
          formData={props.data.dialog || props.data}
          schema={dialogSchema}
          uiSchema={dialogUiSchema}
        >
          <button style={{ display: 'none' }} />
        </Form>
      </div>
    </Customizer>
  );
};

FormEditor.propTypes = {
  data: PropTypes.shape({ data: PropTypes.any }),
  onChange: PropTypes.func,
};

export default FormEditor;
