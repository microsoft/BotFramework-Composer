// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfc/extension';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';

import { FieldLabel } from '../FieldLabel';

const BooleanField: React.FC<FieldProps> = function CheckboxWidget(props) {
  const { onChange, value, label, id, schema, uiOptions } = props;
  const { description } = schema;

  const options: IDropdownOption[] = [
    {
      key: 'none',
      text: '',
    },
    {
      key: 'true',
      text: 'true',
    },
    {
      key: 'false',
      text: 'false',
    },
  ];

  const handleChange = (e, option?: IDropdownOption) => {
    if (option) {
      const optionValue = option.key === 'none' ? undefined : option.key === 'true';
      onChange(optionValue);
    }
  };

  const selectedKey = typeof value === 'boolean' ? value.toString() : '';

  return (
    <React.Fragment>
      <FieldLabel inline description={description} id={id} label={label} helpLink={uiOptions?.helpLink} />
      <Dropdown
        id={id}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={selectedKey}
        onChange={handleChange}
        styles={{
          root: { width: '100%' },
          label: { fontSize: '10px', fontWeight: '400' },
          errorMessage: { display: 'none' },
        }}
      />
    </React.Fragment>
  );
};

export { BooleanField };
