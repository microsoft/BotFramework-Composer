// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { MicrosoftInputDialog } from '@bfc/shared';

import { TextWidget } from '../../widgets';

import { TwoSettingFields } from './twoSettingFields';
import { field, settingsFields, settingsFieldFull, settingsFieldInline } from './styles';
import { PromptFieldChangeHandler, GetSchema, InputDialogKeys } from './types';

interface PromptSettingsrops extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const PromptSettings: React.FC<PromptSettingsrops> = props => {
  const { formData, idSchema, getSchema, onChange, errorSchema } = props;
  const fields: { [key: string]: InputDialogKeys | string }[] = [
    {
      name: 'maxTurnCount',
      title: formatMessage('Max turn count'),
    },
    {
      name: 'defaultValue',
      title: formatMessage('Default value'),
    },
  ];

  return (
    <div>
      <TwoSettingFields fields={fields} {...props} />
      <div css={settingsFields}>
        <div css={[field, settingsFieldFull]}>
          <TextWidget
            onChange={onChange('allowInterruptions')}
            schema={getSchema('allowInterruptions')}
            id={idSchema.allowInterruptions.__id}
            value={formData.allowInterruptions}
            label={formatMessage('Allow interruptions')}
            formContext={props.formContext}
            rawErrors={errorSchema.allowInterruptions && errorSchema.allowInterruptions.__errors}
          />
        </div>
        <div css={[field, settingsFieldFull, settingsFieldInline]}>
          <TextWidget
            onChange={onChange('alwaysPrompt')}
            schema={getSchema('alwaysPrompt')}
            id={idSchema.alwaysPrompt.__id}
            value={formData.alwaysPrompt}
            label={formatMessage('Always prompt')}
            formContext={props.formContext}
            rawErrors={errorSchema.alwaysPrompt && errorSchema.alwaysPrompt.__errors}
          />
        </div>
      </div>
    </div>
  );
};
