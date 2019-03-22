import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from 'office-ui-fabric-react';

export function TextareaWidget(props) {
  const { label, onChange, readonly, value, ...rest } = props;
  const { description, examples = [] } = schema || {};

  let placeholderText = placeholder;

  if (!placeholderText && examples.length > 0) {
    placeholderText = `ex. ${examples.join(', ')}`;
  }

  return (
    <TextField
      {...rest}
      description={description}
      label={label}
      multiline
      onChange={e => onChange(e.target.value)}
      placeholder={placeholderText}
      readOnly={readonly}
      value={value}
    />
  );
}

TextareaWidget.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  readonly: PropTypes.boolean,
  schema: PropTypes.shape({
    description: PropTypes.string,
    examples: PropTypes.arrayOf(PropTypes.string),
  }),
  value: PropTypes.any,
};
