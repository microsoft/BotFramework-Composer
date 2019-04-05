import React from 'react';
import PropTypes from 'prop-types';
import { TextField, SpinButton } from 'office-ui-fabric-react';
import { Position } from 'office-ui-fabric-react/lib/utilities/positioning';

export function TextWidget(props) {
  const { label, onBlur, onChange, readonly, value, schema, placeholder, ...rest } = props;
  const { description, examples = [], type } = schema || {};

  let placeholderText = placeholder;

  if (!placeholderText && examples.length > 0) {
    placeholderText = `ex. ${examples.join(', ')}`;
  }

  if (type === 'integer' || type === 'number') {
    const updateValue = newValue => {
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
        onDecrement={value => updateValue(+value - step)}
        onIncrement={value => updateValue(+value + step)}
        onValidate={value => updateValue(+value)}
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
