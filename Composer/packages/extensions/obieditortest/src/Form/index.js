import React from 'react';
import PropTypes from 'prop-types';
import JSONFrom from 'react-jsonschema-form';

import * as widgets from './widgets';
import * as fields from './fields';
import ArrayFieldTemplate from './ArrayFieldTemplate';
import FieldTemplate from './FieldTemplate';

import './styles.scss';

export default function Form(props) {
  const { formData, schema, uiSchema, onChange, ...rest } = props;

  return (
    <div className="FormContainer">
      <JSONFrom
        ArrayFieldTemplate={ArrayFieldTemplate}
        fields={fields}
        FieldTemplate={FieldTemplate}
        formData={formData}
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
  formData: PropTypes.object,
  onChange: PropTypes.func,
  schema: PropTypes.object,
  uiSchema: PropTypes.object,
};

Form.defaultProps = {
  onChange: () => {},
};
