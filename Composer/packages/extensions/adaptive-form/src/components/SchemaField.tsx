// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfc/extension';

import { getUISchema, resolveFieldWidget, resolveRef, getUiLabel, getUiPlaceholder, getUiDescription } from '../utils';
import { usePluginConfig } from '../hooks';

import { ErrorMessage } from './ErrorMessage';

const schemaField = {
  container: (depth = 0) => css`
    display: flex;
    flex-direction: column;
    margin: 10px ${depth === 0 ? 18 : 0}px;

    label: SchemaFieldContainer;
  `,
  field: (hasError: boolean) => css`
    width: 100%;
    label: SchemaField;
  `,
};

const SchemaField: React.FC<FieldProps> = props => {
  const {
    className,
    definitions,
    name,
    schema: baseSchema,
    uiOptions: baseUIOptions = {},
    value,
    rawErrors,
    hideError,
    onChange,
    ...rest
  } = props;
  const pluginConfig = usePluginConfig();
  const schema = resolveRef(baseSchema, definitions);
  const uiOptions = {
    ...getUISchema(schema, pluginConfig.formSchema),
    ...baseUIOptions,
  };

  const error = typeof rawErrors === 'string' && <ErrorMessage error={rawErrors} label={getUiLabel(props)} />;

  if (!schema || name.startsWith('$')) {
    return null;
  }

  const handleChange = (newValue: any) => {
    const serializedValue =
      typeof uiOptions?.serializer?.set === 'function' ? uiOptions.serializer.set(newValue) : newValue;
    onChange(serializedValue);
  };

  const deserializedValue = typeof uiOptions?.serializer?.get === 'function' ? uiOptions.serializer.get(value) : value;

  const FieldWidget = resolveFieldWidget(schema, uiOptions, pluginConfig);
  const fieldProps = {
    ...rest,
    name,
    uiOptions,
    enumOptions: schema.enum as string[],
    label: getUiLabel({ ...props, uiOptions }),
    placeholder: getUiPlaceholder({ ...props, uiOptions }),
    description: getUiDescription({ ...props, uiOptions }),
    schema,
    value: deserializedValue,
    error: error || undefined,
    rawErrors: typeof rawErrors?.[name] === 'object' ? rawErrors?.[name] : rawErrors,
    onChange: handleChange,
  };

  return (
    <div className={className} css={schemaField.container(props.depth)}>
      <FieldWidget {...fieldProps} />
      {!hideError && error}
    </div>
  );
};

export { SchemaField };
export default SchemaField;
