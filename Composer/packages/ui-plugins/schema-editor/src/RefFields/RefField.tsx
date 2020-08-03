// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps } from '@bfc/extension';

interface RefFieldProps extends FieldProps {
  options: IDropdownOption[];
}

export const RefField: React.FC<RefFieldProps> = ({ description, id, label, value, options, required, onChange }) => {
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
