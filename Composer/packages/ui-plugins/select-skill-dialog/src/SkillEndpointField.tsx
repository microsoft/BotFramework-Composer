// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps, useFormConfig } from '@bfc/extension';
import {
  getUiLabel,
  getUIOptions,
  getUiPlaceholder,
  getUiDescription,
  schemaField,
  SelectField,
} from '@bfc/adaptive-form';

export const SkillEndpointField: React.FC<FieldProps> = (props) => {
  const { depth, schema, uiOptions: baseUIOptions, value, onChange } = props;
  const formUIOptions = useFormConfig();

  const uiOptions = {
    ...getUIOptions(schema, formUIOptions),
    ...baseUIOptions,
  };

  const deserializedValue = typeof uiOptions?.serializer?.get === 'function' ? uiOptions.serializer.get(value) : value;

  const handleChange = (newValue: any) => {
    const serializedValue = newValue;
    if (typeof uiOptions?.serializer?.set === 'function') {
      uiOptions.serializer.set(newValue);
    }
    onChange(serializedValue);
  };

  const label = getUiLabel({ ...props, uiOptions });
  const placeholder = getUiPlaceholder({ ...props, uiOptions });
  const description = getUiDescription({ ...props, uiOptions });

  return (
    <div css={schemaField.container(depth)}>
      <SelectField
        {...props}
        description={description}
        label={label}
        placeholder={placeholder}
        value={deserializedValue}
        onChange={handleChange}
      />
    </div>
  );
};
