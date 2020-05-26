// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfc/extension';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

const ExpressionEditor: React.FC<FieldProps> = (props) => {
  const { id, value = '', onChange, disabled, placeholder, readonly, error } = props;

  const handleChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    onChange(newValue);
  };

  return (
    <TextField
      disabled={disabled}
      errorMessage={error}
      id={id}
      placeholder={placeholder}
      readOnly={readonly}
      styles={{
        root: { width: '100%' },
        errorMessage: { display: 'none' },
      }}
      value={value}
      onChange={handleChange}
      onRenderPrefix={() => {
        return <Icon iconName="Variable" />;
      }}
    />
  );
};

export { ExpressionEditor };
