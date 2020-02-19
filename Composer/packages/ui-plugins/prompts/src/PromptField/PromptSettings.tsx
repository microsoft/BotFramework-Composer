// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { MicrosoftInputDialog } from '@bfc/shared';
import { SchemaField } from '@bfc/adaptive-form';

import { TwoSettingFields } from './twoSettingFields';
import { InputDialogKeys, PromptFieldProps } from './types';

export const PromptSettings: React.FC<PromptFieldProps<MicrosoftInputDialog>> = props => {
  const { id, value, getSchema, onChange, uiOptions, rawErrors, ...rest } = props;
  const fields: InputDialogKeys[] = ['maxTurnCount', 'defaultValue'];

  return (
    <React.Fragment>
      <TwoSettingFields {...props} fields={fields} />
      <SchemaField
        {...rest}
        id={`${id}.allowInterruptions`}
        label={formatMessage('Allow interruptions')}
        rawErrors={rawErrors?.['allowInterruptions']}
        schema={getSchema('allowInterruptions')}
        uiOptions={uiOptions.properties?.allowInterruptions || {}}
        value={value?.allowInterruptions}
        onChange={onChange('allowInterruptions')}
      />
      <SchemaField
        {...rest}
        id={`${id}.alwaysPrompt`}
        label={formatMessage('Always prompt')}
        rawErrors={rawErrors?.['alwaysPrompt']}
        schema={getSchema('alwaysPrompt')}
        uiOptions={uiOptions.properties?.alwaysPrompt || {}}
        value={value?.alwaysPrompt}
        onChange={onChange('alwaysPrompt')}
      />
    </React.Fragment>
  );
};
