import React from 'react';
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

const getOutputFormatOptions = (outputFormatSchema: JSONSchema6) => {
  if (!outputFormatSchema || !outputFormatSchema.enum || !Array.isArray(outputFormatSchema.enum)) {
    return [];
  }

  return outputFormatSchema.enum.map(o => ({ label: o as string, value: o as string }));
};

interface UserAnswersProps extends FieldProps<MicrosoftInputDialog> {
  onChange: (field: keyof MicrosoftInputDialog) => (data: any) => void;
  getSchema: (field: keyof MicrosoftInputDialog) => JSONSchema6;
}

export const UserAnswers: React.FC<UserAnswersProps> = props => {
  const { onChange, getSchema, idSchema, formData, errorSchema } = props;

  return (
    <>
      <div css={field}>
        <TextWidget
          onChange={onChange('property')}
          schema={getSchema('property')}
          id={idSchema.property.__id}
          value={formData.property}
          label={formatMessage('Property to fill')}
          formContext={props.formContext}
          rawErrors={errorSchema.property && errorSchema.property.__errors}
        />
      </div>
      <div css={field}>
        <SelectWidget
          onChange={onChange('$type')}
          schema={getSchema('$type')}
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
      {getSchema('outputFormat') && (
        <div css={field}>
          <SelectWidget
            onChange={onChange('outputFormat')}
            schema={getSchema('outputFormat')}
            id={idSchema.outputFormat.__id}
            value={formData.outputFormat}
            label={formatMessage('Output Format')}
            formContext={props.formContext}
            rawErrors={errorSchema.outputFormat && errorSchema.outputFormat.__errors}
            options={{ enumOptions: getOutputFormatOptions(getSchema('outputFormat')) }}
            onFocus={() => {}}
            onBlur={() => {}}
          />
        </div>
      )}
      <div css={field}>
        <TextWidget
          onChange={onChange('value')}
          schema={getSchema('value')}
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
