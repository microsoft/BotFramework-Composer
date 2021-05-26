// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfc/extension-client';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import { FieldLabel } from '../FieldLabel';

const BooleanField: React.FC<FieldProps> = function CheckboxWidget(props) {
  const { hasIcon, expression, onChange, value, label, id, schema, required, uiOptions } = props;
  const { description } = schema;

  const options: IDropdownOption[] = [
    {
      key: 'none',
      text: '',
    },
    {
      key: 'true',
      text: formatMessage('true'),
    },
    {
      key: 'false',
      text: formatMessage('false'),
    },
  ];

  if (expression) {
    options.push({
      key: 'expression',
      text: formatMessage('Write an expression'),
    });
  }

  const handleChange = (e, option?: IDropdownOption) => {
    if (option) {
      let optionValue: boolean | string | undefined;
      switch (option.key) {
        case 'true':
          optionValue = true;
          break;
        case 'false':
          optionValue = false;
          break;
        case 'expression':
          optionValue = '=';
          break;
        case 'none':
        default:
          optionValue = undefined;
          break;
      }

      onChange(optionValue);
    }
  };

  const selectedKey = typeof value === 'boolean' ? value.toString() : '';

  return (
    <React.Fragment>
      <FieldLabel
        inline
        description={description}
        helpLink={uiOptions?.helpLink}
        id={id}
        label={label}
        required={required}
      />
      <Dropdown
        ariaLabel={label || formatMessage('boolean field')}
        id={id}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={selectedKey}
        styles={{
          root: { width: '100%' },
          title: {
            borderRadius: hasIcon ? '0 2px 2px 0' : undefined,
          },
          errorMessage: { display: 'none' },
        }}
        onChange={handleChange}
      />
    </React.Fragment>
  );
};

export { BooleanField };
