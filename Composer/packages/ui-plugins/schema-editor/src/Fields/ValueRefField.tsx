// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps } from '@bfc/extension';
import startCase from 'lodash/startCase';

import { valueTypeDefinitions } from '../schema';

export const ValueRefField: React.FC<FieldProps> = ({ description, id, label, value, required, onChange }) => {
  const options = useMemo<IDropdownOption[]>(() => {
    return Object.entries(valueTypeDefinitions || {}).map(([key, value]) => ({
      key: `#/definitions/${key}`,
      text: value?.title || startCase(key),
    }));
  }, []);

  const handleChange = (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      onChange(option.key);
    }
  };

  return (
    <React.Fragment>
      <FieldLabel description={description} id={id} label={label} required={required} />
      <Dropdown
        id={id}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={value}
        styles={{
          root: { width: '100%' },
          errorMessage: { display: 'none' },
        }}
        onChange={handleChange}
      />
    </React.Fragment>
  );
};
