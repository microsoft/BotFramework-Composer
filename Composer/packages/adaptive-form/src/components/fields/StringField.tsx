// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfc/extension-client';
import { NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { FieldLabel } from '../FieldLabel';

import { TextField } from './TextField/TextField';

export const borderStyles = (transparentBorder: boolean, error: boolean) =>
  transparentBorder
    ? {
        fieldGroup: {
          borderColor: error ? undefined : 'transparent',
          transition: 'border-color 0.1s linear',
          selectors: {
            ':hover': {
              borderColor: error ? undefined : NeutralColors.gray30,
            },
          },
        },
      }
    : {};

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
    uiOptions,
    required,
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
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <TextField
        ariaLabel={label || formatMessage('string field')}
        defaultValue={value}
        disabled={disabled}
        errorMessage={error}
        id={id}
        placeholder={placeholder}
        readOnly={readonly}
        styles={{
          ...borderStyles(Boolean(transparentBorder), Boolean(error)),
          root: { width: '100%' },
          errorMessage: { display: 'none' },
        }}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
      />
    </>
  );
};
