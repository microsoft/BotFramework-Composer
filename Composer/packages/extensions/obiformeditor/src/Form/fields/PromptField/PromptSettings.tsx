/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';

import { TextWidget, SelectWidget, CheckboxWidget } from '../../widgets';

import { field, settingsFields, settingsFieldHalf, settingsFieldFull, settingsFieldInline } from './styles';

interface PromptSettingsrops extends FieldProps<MicrosoftInputDialog> {
  onChange: (field: keyof MicrosoftInputDialog) => (data: any) => void;
  getSchema: (field: keyof MicrosoftInputDialog) => JSONSchema6;
}

export const PromptSettings: React.FC<PromptSettingsrops> = props => {
  const { formData, idSchema, getSchema, onChange, errorSchema } = props;

  const interruptionOptions = (getSchema('allowInterruptions').enum || []).map(o => ({
    label: o as string,
    value: o as string,
  }));

  return (
    <div css={settingsFields}>
      <div css={[field, settingsFieldHalf]}>
        <TextWidget
          onChange={onChange('maxTurnCount')}
          schema={getSchema('maxTurnCount')}
          id={idSchema.maxTurnCount.__id}
          value={formData.maxTurnCount}
          label={formatMessage('Max turn count')}
          formContext={props.formContext}
          rawErrors={errorSchema.maxTurnCount && errorSchema.maxTurnCount.__errors}
        />
      </div>
      <div css={[field, settingsFieldHalf]}>
        <TextWidget
          onChange={onChange('defaultValue')}
          schema={getSchema('defaultValue')}
          id={idSchema.defaultValue.__id}
          value={formData.defaultValue}
          label={formatMessage('Default value')}
          formContext={props.formContext}
          rawErrors={errorSchema.defaultValue && errorSchema.defaultValue.__errors}
        />
      </div>
      <div css={[field, settingsFieldFull]}>
        <SelectWidget
          onChange={onChange('allowInterruptions')}
          schema={getSchema('allowInterruptions')}
          id={idSchema.allowInterruptions.__id}
          value={formData.allowInterruptions}
          label={formatMessage('Allow interruptions')}
          formContext={props.formContext}
          rawErrors={errorSchema.allowInterruptions && errorSchema.allowInterruptions.__errors}
          options={{ enumOptions: interruptionOptions }}
        />
      </div>
      <div css={[field, settingsFieldFull, settingsFieldInline]}>
        <CheckboxWidget
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
  );
};
