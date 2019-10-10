import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';
import { SDKTypes } from 'shared';

import { TextWidget, SelectWidget } from '../../widgets';

import { field } from './styles';
import { GetSchema, PromptFieldChangeHandler } from './types';
import { ChoiceInputSettings } from './ChoiceInput';
import { ConfirmInputSettings } from './ConfirmInput';

const getOptions = (enumSchema: JSONSchema6) => {
  if (!enumSchema || !enumSchema.enum || !Array.isArray(enumSchema.enum)) {
    return [];
  }

  return enumSchema.enum.map(o => ({ label: o as string, value: o as string }));
};

interface UserAnswersProps extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
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
            options={{ enumOptions: getOptions(getSchema('outputFormat')) }}
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
      {getSchema('defaultLocale') && (
        <div css={field}>
          <TextWidget
            onChange={onChange('defaultLocale')}
            schema={getSchema('defaultLocale')}
            id={idSchema.defaultLocale.__id}
            value={(formData as ChoiceInput).defaultLocale}
            label={formatMessage('Default locale')}
            formContext={props.formContext}
            rawErrors={errorSchema.defaultLocale && errorSchema.defaultLocale.__errors}
          />
        </div>
      )}
      {getSchema('style') && (
        <div css={field}>
          <SelectWidget
            onChange={onChange('style')}
            schema={getSchema('style')}
            id={idSchema.style.__id}
            value={(formData as ChoiceInput).style}
            label={formatMessage('List style')}
            formContext={props.formContext}
            rawErrors={errorSchema.style && errorSchema.style.__errors}
            options={{ enumOptions: getOptions(getSchema('style')) }}
          />
        </div>
      )}
      {formData.$type === SDKTypes.ChoiceInput && <ChoiceInputSettings {...props} formData={formData as ChoiceInput} />}
      {formData.$type === SDKTypes.ConfirmInput && (
        <ConfirmInputSettings {...props} formData={formData as ConfirmInput} />
      )}
    </>
  );
};
