import React from 'react';
import { TextField, SpinButton } from 'office-ui-fabric-react';

import { BFDWidgetProps } from '../types';

import { ExpressionWidget } from './ExpressionWidget';
import { WidgetLabel } from './WidgetLabel';

const getInt = (value: string, step: number) => {
  return parseInt(value, 10) + step;
};

const getFloat = (value: string, step: number) => {
  return (parseFloat(value) + step).toFixed(step > 0 ? `${step}`.split('.')[1].length : step);
};

export function TextWidget(props: BFDWidgetProps) {
  const {
    label,
    onBlur,
    onChange,
    onFocus,
    readonly,
    value,
    placeholder,
    schema,
    id,
    disabled,
    formContext,
    rawErrors,
  } = props;
  const { description, examples = [], type, $role } = schema;

  let placeholderText = placeholder;

  if (!placeholderText && examples.length > 0) {
    placeholderText = `ex. ${examples.join(', ')}`;
  }

  if (type === 'integer' || type === 'number') {
    const updateValue = (step: number) => (value: string) => {
      // if the number is a float, we need to convert to a fixed decimal place
      // in order to avoid floating point math rounding errors (ex. 1.2000000001)
      // ex. if step = 0.01, we fix to 2 decimals
      const newValue = type === 'integer' ? getInt(value, step) : getFloat(value, step);

      onChange(newValue);
      // need to allow form data to propagate before flushing to state
      setTimeout(() => onBlur(id, value));
    };

    const step = type === 'integer' ? 1 : 0.1;

    return (
      <>
        <WidgetLabel label={label} description={description} id={id} />
        <SpinButton
          onDecrement={updateValue(-step)}
          onIncrement={updateValue(step)}
          onValidate={updateValue(0)}
          disabled={Boolean(schema.const) || readonly || disabled}
          step={step}
          value={value}
          styles={{
            labelWrapper: { display: 'none' },
          }}
        />
      </>
    );
  }

  const sharedProps = {
    disabled,
    id,
    value,
    autoComplete: 'off',
    onBlur: () => onBlur(id, value),
    onChange: (_, newValue?: string) => onChange(newValue),
    onFocus: () => onFocus(id, value),
    placeholder: placeholderText,
    readOnly: Boolean(schema.const) || readonly,
  };

  if ($role === 'expression') {
    return (
      <ExpressionWidget
        {...sharedProps}
        label={label}
        schema={schema}
        formContext={formContext}
        rawErrors={rawErrors}
      />
    );
  }

  return (
    <>
      <WidgetLabel label={label} description={description} id={id} />
      <TextField {...sharedProps} />
    </>
  );
}

TextWidget.defaultProps = {
  schema: {},
};
