// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldProps } from '@bfc/extension';
import formatMessage from 'format-message';

import { FieldLabel } from '../FieldLabel';

export const SelectField: React.FC<FieldProps<string | number>> = function SelectField(props) {
  const { description, enumOptions, id, label, onBlur, onChange, onFocus, value = '', error, uiOptions } = props;

  const options: IDropdownOption[] = (enumOptions ?? []).map((o) => ({
    key: o?.toString(),
    text: o?.toString(),
  }));

  options.unshift({
    key: '',
    text: '',
  });

  const handleChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      onChange(option.key);
    } else {
      onChange(undefined);
    }
  };

  return (
    <>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} />
      <Dropdown
        ariaLabel={label || formatMessage('selection field')}
        errorMessage={error as string}
        id={id}
        onBlur={() => onBlur && onBlur(id, value)}
        onChange={handleChange}
        onFocus={() => onFocus && onFocus(id, value)}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={value}
        styles={{
          errorMessage: { display: 'none' },
        }}
      />
    </>
  );
};
