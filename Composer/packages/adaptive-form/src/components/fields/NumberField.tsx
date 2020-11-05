// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { FieldProps } from '@bfc/extension-client';

import { StringField } from './StringField';

const floatNumberOfDecimals = 2;

const NumberField: React.FC<FieldProps> = (props) => {
  const { expression, schema, onChange } = props;
  const { type } = schema;

  const [value, setValue] = useState<string | undefined>(typeof props.value === 'number' ? props.value.toString() : '');

  // if the number is a float, we need to convert to a fixed decimal place
  // in order to avoid floating point math rounding errors (ex. 1.2000000001)
  // ex. if step = 0.01, we fix to 2 decimals
  const handleChange = (newValue?: string) => {
    if (typeof newValue !== 'undefined') {
      if (expression && newValue.startsWith('=')) {
        onChange(newValue);
      } else if (!isNaN(Number(newValue))) {
        if (type === 'number') {
          const numberValue = +parseFloat(newValue).toFixed(floatNumberOfDecimals);
          onChange(numberValue);
          setValue(newValue);
        } else if (type === 'integer') {
          const integer = parseInt(newValue, 10);
          const integerValue = !isNaN(integer) ? integer : '';
          onChange(integerValue);
          setValue(integerValue.toString());
        }
      }
    }
  };

  return <StringField {...props} value={value} onChange={handleChange} />;
};

export { NumberField };
