// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfc/extension';
import { NeutralColors } from '@uifabric/fluent-theme';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { FieldLabel } from '../FieldLabel';

export const StringField: React.FC<FieldProps<string>> = function StringField(props) {
  const {
    id,
    value = '',
    onChange,
    disabled,
    label,
    description,
    placeholder,
    readonly,
    transparentBorder,
    onFocus,
    onBlur,
    error,
  } = props;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (typeof onFocus === 'function') {
      e.stopPropagation();
      onFocus(id, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (typeof onBlur === 'function') {
      e.stopPropagation();
      onBlur(id, value);
    }
  };

  const handleChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    onChange(newValue);
  };

  return (
    <>
      <FieldLabel description={description} id={id} label={label} />
      <TextField
        disabled={disabled}
        errorMessage={error}
        id={id}
        placeholder={placeholder}
        readOnly={readonly}
        styles={{
          ...(transparentBorder
            ? {
                fieldGroup: {
                  borderColor: 'transparent',
                  transition: 'border-color 0.1s linear',
                  selectors: {
                    ':hover': {
                      borderColor: NeutralColors.gray30,
                    },
                  },
                },
              }
            : {}),
          root: { width: '100%' },
          errorMessage: { display: 'none' },
        }}
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
      />
    </>
  );
};
