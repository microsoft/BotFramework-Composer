import React from 'react';
import PropTypes from 'prop-types';
import { TextField, SpinButton } from 'office-ui-fabric-react';
import { Position } from 'office-ui-fabric-react/lib/utilities/positioning';

const getInt = (value, step) => {
  return parseInt(value, 10) + step;
};

const getFloat = (value, step) => {
  return (parseFloat(value) + step).toFixed(step > 0 ? `${step}`.split('.')[1].length : step);
};

export function TextWidget(props) {
  const { label, onBlur, onChange, readonly, value, schema, placeholder, ...rest } = props;
  const { description, examples = [], type } = schema || {};

  let placeholderText = placeholder;

  if (!placeholderText && examples.length > 0) {
    placeholderText = `ex. ${examples.join(', ')}`;
  }

  if (type === 'integer' || type === 'number') {
    const updateValue = step => value => {
      // if the number is a float, we need to convert to a fixed decimal place
      // in order to avoid floating point math rounding errors (ex. 1.2000000001)
      // ex. if step = 0.01, we fix to 2 decimals
      const newValue = type === 'integer' ? getInt(value, step) : getFloat(value, step);

      onChange(newValue);
      // need to allow form data to propagate before flushing to state
      setTimeout(onBlur);
    };

    const step = type === 'integer' ? 1 : 0.1;

    return (
      <SpinButton
        {...rest}
        label={label}
        labelPosition={Position.top}
        onDecrement={updateValue(-step)}
        onIncrement={updateValue(step)}
        onValidate={updateValue(0)}
        placeholder={placeholderText}
        readOnly={Boolean(schema.const) || readonly}
        step={step}
        value={value}
      />
    );
  }

  return (
    <TextField
      {...rest}
      description={description}
      label={label}
      onBlur={onBlur}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholderText}
      readOnly={Boolean(schema.const) || readonly}
      value={value}
    />
  );
}

TextWidget.propTypes = {
  label: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  readonly: PropTypes.bool,
  schema: PropTypes.shape({
    description: PropTypes.string,
    examples: PropTypes.arrayOf(PropTypes.string),
  }),
  value: PropTypes.any,
};
