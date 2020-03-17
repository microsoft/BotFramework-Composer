// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useContext } from 'react';
import { FieldProps } from '@bfc/extension';

import { getUISchema, resolveFieldWidget, resolveRef, getUiLabel, getUiPlaceholder, getUiDescription } from '../utils';
import PluginContext from '../PluginContext';

import { ErrorMessage } from './ErrorMessage';

const schemaField = {
  container: (depth = 0) => css`
    margin: 10px ${depth === 0 ? 18 : 0}px;
    label: SchemaFieldContainer;
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
  } = props;
  const pluginConfig = useContext(PluginContext);
  const schema = resolveRef(baseSchema, definitions);
  const uiOptions = {
    ...getUISchema(schema, pluginConfig.uiSchema),
    ...baseUIOptions,
  };

  if (!schema || name.startsWith('$')) {
    return null;
  }

  const error = typeof rawErrors === 'string' && <ErrorMessage error={rawErrors} label={getUiLabel(props)} />;

  const FieldWidget = resolveFieldWidget(schema, uiOptions, pluginConfig);
  const fieldProps = {
    ...props,
    uiOptions,
    enumOptions: schema.enum as string[],
    label: getUiLabel({ ...props, uiOptions }),
    placeholder: getUiPlaceholder({ ...props, uiOptions }),
    description: getUiDescription({ ...props, uiOptions }),
    schema,
    value,
    error: error || undefined,
    rawErrors: typeof rawErrors?.[name] === 'object' ? rawErrors?.[name] : rawErrors,
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
