// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { FieldProps } from '@bfc/extension';
import { EditableField } from '@bfc/adaptive-form';
import formatMessage from 'format-message';

const SynonymsField: React.FC<FieldProps<string[]>> = props => {
  const { value = [], onChange, ...rest } = props;

  const handleChange = (newValue?: string) => {
    if (newValue) {
      onChange(newValue.split(', '));
    } else {
      onChange(undefined);
    }
  };

  return (
    <EditableField
      {...rest}
      placeholder={formatMessage('Add multiple comma-separated synonyms')}
      value={(value || []).join(', ')}
      onChange={handleChange}
    />
  );
};

export { SynonymsField };
