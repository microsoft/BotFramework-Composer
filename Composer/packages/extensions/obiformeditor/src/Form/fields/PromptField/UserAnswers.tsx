import React from 'react';
import get from 'lodash.get';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';
import { SDKTypes } from 'shared-menus';

import { TextWidget, SelectWidget } from '../../widgets';

import { field } from './styles';

const PROMPT_TYPES = [
  {
    label: formatMessage('Attachment'),
    value: SDKTypes.AttachmentInput,
  },
  {
    label: formatMessage('Multiple Choice'),
    value: SDKTypes.ChoiceInput,
  },
  {
    label: formatMessage('Confirmation'),
    value: SDKTypes.ConfirmInput,
  },
  {
    label: formatMessage('Date or time'),
    value: SDKTypes.DateTimeInput,
  },
  {
    label: formatMessage('Number'),
    value: SDKTypes.NumberInput,
  },
  {
    label: formatMessage('Text'),
    value: SDKTypes.TextInput,
  },
];

const getSchema = (schema: JSONSchema6, field: keyof MicrosoftInputDialog): JSONSchema6 => {
  const fieldSchema = get(schema, ['properties', field]);

  return fieldSchema;
};

const getOutputFormatOptions = (schema: JSONSchema6) => {
  const outputFormatSchema = get(schema, 'properties.outputFormat');

  if (!outputFormatSchema || !outputFormatSchema.enum || !Array.isArray(outputFormatSchema.enum)) {
    return [];
  }

  return outputFormatSchema.enum.map(o => ({ label: o, value: o }));
};

export const UserAnswers: React.FC<FieldProps<MicrosoftInputDialog>> = props => {
  const { onChange, schema, idSchema, formData, errorSchema } = props;

  const handleChange = (field: keyof MicrosoftInputDialog) => (data: any) => {
    if (onChange) {
      onChange({ ...props.formData, [field]: data });
    }
  };

  return (
    <>
      <div css={field}>
        <TextWidget
          onChange={handleChange('property')}
          schema={getSchema(schema, 'property')}
          id={idSchema.property.__id}
          value={formData.property}
          label={formatMessage('Property to fill')}
          formContext={props.formContext}
          rawErrors={errorSchema.property && errorSchema.property.__errors}
        />
      </div>
      <div css={field}>
        <SelectWidget
          onChange={handleChange('$type')}
          schema={getSchema(schema, '$type')}
          id={idSchema.$type.__id}
          value={formData.$type}
          label={formatMessage('Answer type')}
          formContext={props.formContext}
          rawErrors={errorSchema.$type && errorSchema.$type.__errors}
          options={{ enumOptions: PROMPT_TYPES }}
          onFocus={() => {}}
          onBlur={() => {}}
        />
      </div>
      {getSchema(schema, 'outputFormat') && (
        <div css={field}>
          <SelectWidget
            onChange={handleChange('outputFormat')}
            schema={getSchema(schema, 'outputFormat')}
            id={idSchema.outputFormat.__id}
            value={formData.outputFormat}
            label={formatMessage('Output Format')}
            formContext={props.formContext}
            rawErrors={errorSchema.outputFormat && errorSchema.outputFormat.__errors}
            options={{ enumOptions: getOutputFormatOptions(schema) }}
            onFocus={() => {}}
            onBlur={() => {}}
          />
        </div>
      )}
      <div css={field}>
        <TextWidget
          onChange={handleChange('value')}
          schema={getSchema(schema, 'value')}
          id={idSchema.value.__id}
          value={formData.value}
          label={formatMessage('Value')}
          formContext={props.formContext}
          rawErrors={errorSchema.value && errorSchema.value.__errors}
        />
      </div>
    </>
  );
};
