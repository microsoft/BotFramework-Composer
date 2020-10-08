// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { FieldProps } from '@bfc/extension-client';

import { StringField } from './StringField';

const floatNumberOfDecimals = 2;

const NumberField: React.FC<FieldProps> = (props) => {
  const { schema, onChange } = props;
  const { type } = schema;

  const [value, setValue] = useState<string | undefined>(props.value);

  // if the number is a float, we need to convert to a fixed decimal place
  // in order to avoid floating point math rounding errors (ex. 1.2000000001)
  // ex. if step = 0.01, we fix to 2 decimals
  const handleChange = (value?: string) => {
    setValue(value);

    if (typeof value === 'undefined' || isNaN(Number(value))) {
      onChange(value);
    } else {
      const newValue = type === 'integer' ? parseInt(value, 10) : +parseFloat(value).toFixed(floatNumberOfDecimals);
      onChange(newValue);
    }
  };

  return <StringField {...props} value={value} onChange={handleChange} />;
};

export { NumberField };
