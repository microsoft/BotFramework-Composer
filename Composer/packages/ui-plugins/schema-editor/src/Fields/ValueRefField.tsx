// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps } from '@bfc/extension-client';
import startCase from 'lodash/startCase';

import { valueTypeDefinitions } from '../schema';
import { SCHEMA_URI } from '../contants';

export const ValueRefField: React.FC<FieldProps> = ({ description, id, label, value, required, onChange }) => {
  const options = useMemo<IDropdownOption[]>(() => {
    return Object.entries(valueTypeDefinitions || {})
      .filter(([key]) => key !== 'equalsExpression') // a value must be a type, not just an expression
      .map(([key, value]) => ({
        key: `${SCHEMA_URI}#/definitions/${key}`,
        text: value?.title || startCase(key),
      }));
  }, []);

  const handleChange = (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      onChange(option.key);
    }
  };

  // fake it til you make it
  const selectedValue = value && !value.includes(SCHEMA_URI) ? `${SCHEMA_URI}${value}` : value;

  return (
    <React.Fragment>
      <FieldLabel description={description} id={id} label={label} required={required} />
      <Dropdown
        id={id}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={selectedValue}
        styles={{
          root: { width: '100%' },
          errorMessage: { display: 'none' },
        }}
        onChange={handleChange}
      />
    </React.Fragment>
  );
};
