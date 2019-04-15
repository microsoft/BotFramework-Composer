import React from 'react';
import PropTypes from 'prop-types';
import JSONForm from 'react-jsonschema-form';

import * as widgets from './widgets';
import * as fields from './fields';
import ArrayFieldTemplate from './ArrayFieldTemplate';
import ObjectFieldTemplate from './ObjectFieldTemplate';
import FieldTemplate from './FieldTemplate';

import './styles.scss';

export default function Form(props) {
  const { formData, schema, uiSchema, onChange, formContext, ...rest } = props;

  return (
    <div className="FormContainer">
      <JSONForm
        ArrayFieldTemplate={ArrayFieldTemplate}
        fields={fields}
        FieldTemplate={FieldTemplate}
        formContext={formContext}
        formData={formData}
        ObjectFieldTemplate={ObjectFieldTemplate}
        onChange={onChange}
        schema={schema}
        uiSchema={uiSchema}
        widgets={widgets}
        {...rest}
      />
    </div>
  );
}

Form.propTypes = {
  formContext: PropTypes.object,
  formData: PropTypes.object,
  onChange: PropTypes.func,
  schema: PropTypes.object,
  uiSchema: PropTypes.object,
};

Form.defaultProps = {
  onChange: () => {},
};
