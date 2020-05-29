// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { MicrosoftInputDialog } from '@bfc/shared';
import { SchemaField } from '@bfc/adaptive-form';

import { PromptFieldProps } from './types';

const BotAsks: React.FC<PromptFieldProps<MicrosoftInputDialog>> = props => {
  const { onChange, getSchema, uiOptions, value, getError, definitions, depth, id } = props;

  return (
    <SchemaField
      definitions={definitions}
      depth={depth}
      id={`${id}.prompt`}
      name="prompt"
      rawErrors={getError('prompt')}
      schema={getSchema('prompt')}
      uiOptions={uiOptions.properties?.prompt || {}}
      value={value?.prompt}
      onChange={onChange('prompt')}
    />
  );
};

export { BotAsks };
