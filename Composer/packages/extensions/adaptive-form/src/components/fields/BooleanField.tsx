// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfc/extension';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import { FieldLabel } from '../FieldLabel';

const BooleanField: React.FC<FieldProps> = function CheckboxWidget(props) {
  const { onChange, value, label, id, schema, required, uiOptions } = props;
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
      <FieldLabel
        inline
        description={description}
        id={id}
        label={label}
        helpLink={uiOptions?.helpLink}
        required={required}
      />
      <Dropdown
        id={id}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={selectedKey}
        onChange={handleChange}
        styles={{
          root: { width: '100%' },
          errorMessage: { display: 'none' },
        }}
        ariaLabel={label || formatMessage('boolean field')}
      />
    </React.Fragment>
  );
};

export { BooleanField };
