// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfc/extension';
import { MicrosoftInputDialog } from '@bfc/shared';
import { SchemaField } from '@bfc/adaptive-form';

import { GetSchema, PromptFieldChangeHandler } from './types';

interface BotAsksProps extends Omit<FieldProps<MicrosoftInputDialog>, 'onChange'> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

const BotAsks: React.FC<BotAsksProps> = props => {
  const { onChange, getSchema, uiOptions, ...rest } = props;

  return (
    <SchemaField
      {...rest}
      schema={getSchema('prompt')}
      uiOptions={uiOptions.properties?.prompt || {}}
      onChange={onChange('prompt')}
    />
  );
};

export { BotAsks };
