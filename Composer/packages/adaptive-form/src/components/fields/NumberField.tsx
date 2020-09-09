// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps } from '@bfc/extension';
import formatMessage from 'format-message';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';
import React from 'react';

import { FieldLabel } from '../FieldLabel';

const floatNumberOfDecimals = 2;

const getInt = (value: string, step: number) => {
  return parseInt(value, 10) + step;
};

const getFloat = (value: string, step: number) => {
  const fixed = (parseFloat(value) + step).toFixed(floatNumberOfDecimals);

  return parseFloat(fixed);
};

const NumberField: React.FC<FieldProps> = (props) => {
  const { description, disabled, id, label, onChange, readonly, schema, value, required, uiOptions } = props;

  const { type } = schema;

  const updateValue = (step: number) => (value: string) => {
    if (value === '') {
      onChange(0);
      return;
    }

    // if the number is a float, we need to convert to a fixed decimal place
    // in order to avoid floating point math rounding errors (ex. 1.2000000001)
    // ex. if step = 0.01, we fix to 2 decimals
    const newValue = type === 'integer' ? getInt(value, step) : getFloat(value, step);

    onChange(newValue);
  };

  const step = type === 'integer' ? 1 : Math.pow(10, -floatNumberOfDecimals);
  const displayValue = typeof value === 'number' ? value.toString() : '';

  return (
    <>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <SpinButton
        ariaLabel={label || formatMessage('numeric field')}
        decrementButtonAriaLabel={formatMessage('decrement by { step }', { step })}
        disabled={Boolean(schema.const) || readonly || disabled}
        id={id}
        incrementButtonAriaLabel={formatMessage('increment by { step }', { step })}
        step={step}
        styles={{
          labelWrapper: { display: 'none' },
        }}
        value={displayValue}
        onDecrement={updateValue(-step)}
        onIncrement={updateValue(step)}
        onValidate={updateValue(0)}
      />
    </>
  );
};

export { NumberField };
