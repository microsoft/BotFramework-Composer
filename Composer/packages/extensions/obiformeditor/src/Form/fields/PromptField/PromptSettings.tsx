/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';
import get from 'lodash.get';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';

import { TextWidget, SelectWidget, CheckboxWidget } from '../../widgets';

import { field, settingsFields, settingsFieldHalf, settingsFieldFull, settingsFieldInline } from './styles';

const getSchema = (schema: JSONSchema6, field: keyof MicrosoftInputDialog): JSONSchema6 => {
  const fieldSchema = get(schema, ['properties', field]);

  return fieldSchema;
};

export const PromptSettings: React.FC<FieldProps<MicrosoftInputDialog>> = props => {
  const { formData, idSchema, schema, onChange, errorSchema } = props;

  const handleChange = (field: keyof MicrosoftInputDialog) => (data: any) => {
    if (onChange) {
      onChange({ ...props.formData, [field]: data });
    }
  };

  const interruptionOptions = (getSchema(schema, 'allowInterruptions').enum || []).map(o => ({
    label: o as string,
    value: o as string,
  }));

  return (
    <div css={settingsFields}>
      <div css={[field, settingsFieldHalf]}>
        <TextWidget
          onChange={handleChange('maxTurnCount')}
          schema={getSchema(schema, 'maxTurnCount')}
          id={idSchema.maxTurnCount.__id}
          value={formData.maxTurnCount}
          label={formatMessage('Max turn count')}
          formContext={props.formContext}
          rawErrors={errorSchema.maxTurnCount && errorSchema.maxTurnCount.__errors}
        />
      </div>
      <div css={[field, settingsFieldHalf]}>
        <TextWidget
          onChange={handleChange('defaultValue')}
          schema={getSchema(schema, 'defaultValue')}
          id={idSchema.defaultValue.__id}
          value={formData.defaultValue}
          label={formatMessage('Default value')}
          formContext={props.formContext}
          rawErrors={errorSchema.defaultValue && errorSchema.defaultValue.__errors}
        />
      </div>
      <div css={[field, settingsFieldFull]}>
        <SelectWidget
          onChange={handleChange('allowInterruptions')}
          schema={getSchema(schema, 'allowInterruptions')}
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
          onChange={handleChange('alwaysPrompt')}
          schema={getSchema(schema, 'alwaysPrompt')}
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
