// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';
import { FieldProps } from '@bfc/extension';

import { FieldLabel } from '../FieldLabel';

const getInt = (value: string, step: number) => {
  return parseInt(value, 10) + step;
};

const getFloat = (value: string, step: number) => {
  const fixed = (parseFloat(value) + step).toFixed(step !== 0 ? `${step}`.split('.')[1].length : step);

  return parseFloat(fixed);
};

export const NumberField: React.FC<FieldProps> = function NumberField(props) {
  const { description, disabled, id, label, onChange, readonly, schema, value } = props;

  const { type } = schema;

  const updateValue = (step: number) => (value: string) => {
    // if the number is a float, we need to convert to a fixed decimal place
    // in order to avoid floating point math rounding errors (ex. 1.2000000001)
    // ex. if step = 0.01, we fix to 2 decimals
    const newValue = type === 'integer' ? getInt(value, step) : getFloat(value, step);

    onChange(newValue);
  };

  const step = type === 'integer' ? 1 : 0.1;

  return (
    <>
      <FieldLabel description={description} id={id} label={label} />
      <SpinButton
        disabled={Boolean(schema.const) || readonly || disabled}
        step={step}
        styles={{
          labelWrapper: { display: 'none' },
        }}
        value={value}
        onDecrement={updateValue(-step)}
        onIncrement={updateValue(step)}
        onValidate={updateValue(0)}
      />
    </>
  );
};
