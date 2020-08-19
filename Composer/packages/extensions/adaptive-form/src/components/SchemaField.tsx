// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useEffect } from 'react';
import { FieldProps, UIOptions, useFormConfig } from '@bfc/extension';

import { getUIOptions, resolveFieldWidget, resolveRef, getUiLabel, getUiPlaceholder, getUiDescription } from '../utils';

import { ErrorMessage } from './ErrorMessage';

const schemaField = {
  container: (depth = 0) => css`
    display: flex;
    flex-direction: column;
    margin: 10px ${depth === 0 ? 18 : 0}px;

    label: SchemaFieldContainer;
  `,
};

const SchemaField: React.FC<FieldProps> = (props) => {
  const {
    className,
    definitions,
    name,
    schema: baseSchema,
    uiOptions: baseUIOptions = {},
    value,
    rawErrors,
    hideError,
    hidden,
    onChange,
    ...rest
  } = props;
  const formUIOptions = useFormConfig();

  const schema = resolveRef(baseSchema, definitions);
  const uiOptions: UIOptions = {
    ...getUIOptions(schema, formUIOptions),
    ...baseUIOptions,
  };

  const handleChange = (newValue: any) => {
    const serializedValue =
      typeof uiOptions?.serializer?.set === 'function' ? uiOptions.serializer.set(newValue) : newValue;

    onChange(serializedValue);
  };

  useEffect(() => {
    if (typeof value === 'undefined') {
      if (schema.const) {
        handleChange(schema.const);
      } else if (schema.default) {
        handleChange(schema.default);
      }
    }
  }, []);

  if (name.startsWith('$') || hidden) {
    return null;
  }

  const error = typeof rawErrors === 'string' && (
    <ErrorMessage error={rawErrors} helpLink={uiOptions.helpLink} label={getUiLabel(props)} />
  );

  const deserializedValue = typeof uiOptions?.serializer?.get === 'function' ? uiOptions.serializer.get(value) : value;

  const FieldWidget = resolveFieldWidget(schema, uiOptions, formUIOptions);
  const fieldProps: FieldProps = {
    ...rest,
    definitions,
    description: getUiDescription({ ...props, uiOptions }),
    enumOptions: schema.enum as string[],
    error: error || undefined,
    label: getUiLabel({ ...props, uiOptions }),
    name,
    onChange: handleChange,
    placeholder: getUiPlaceholder({ ...props, uiOptions }),
    rawErrors: typeof rawErrors?.[name] === 'object' ? rawErrors?.[name] : rawErrors,
    schema,
    uiOptions,
    value: deserializedValue,
  };

  return (
    <div className={className} css={schemaField.container(props.depth)}>
      <FieldWidget {...fieldProps} />
      {!hideError && !uiOptions.hideError && error}
    </div>
  );
};

export { SchemaField, schemaField };
export default SchemaField;
