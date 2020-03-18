// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { MicrosoftInputDialog } from '@bfc/shared';
import { SchemaField } from '@bfc/adaptive-form';

import { PromptFieldProps } from './types';

const BotAsks: React.FC<PromptFieldProps<MicrosoftInputDialog>> = props => {
  const { onChange, getSchema, uiOptions, value, getError, ...rest } = props;

  return (
    <SchemaField
      {...rest}
      name="prompt"
      value={value?.prompt}
      schema={getSchema('prompt')}
      uiOptions={uiOptions.properties?.prompt || {}}
      onChange={onChange('prompt')}
      rawErrors={getError('prompt')}
    />
  );
};

export { BotAsks };
