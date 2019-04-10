import React from 'react';
import PropTypes from 'prop-types';
import JSONFrom from 'react-jsonschema-form';

import * as widgets from './widgets';
import * as fields from './fields';
import FieldTemplate from './FieldTemplate';

import './styles.scss';

export default function Form(props) {
  const { formData, schema, uiSchema, onChange, ...rest } = props;

  return (
    <div className="FormContainer">
      <JSONFrom
        schema={schema}
        uiSchema={uiSchema}
        widgets={widgets}
        fields={fields}
        formData={formData}
        onChange={onChange}
        FieldTemplate={FieldTemplate}
        {...rest}
      />
    </div>
  );
}

Form.propTypes = {
  formData: PropTypes.object,
  onChange: PropTypes.func,
  schema: PropTypes.object,
  uiSchema: PropTypes.object,
};

Form.defaultProps = {
  onChange: () => {},
};
