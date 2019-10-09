import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';

import { TextareaWidget } from '../../widgets';

import { Validations } from './Validations';
import { field } from './styles';
import { PromptFieldChangeHandler, GetSchema } from './types';

interface ExceptionsProps extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const Exceptions: React.FC<ExceptionsProps> = props => {
  const { onChange, getSchema, idSchema, formData, errorSchema } = props;

  return (
    <>
      <div css={field}>
        <TextareaWidget
          onChange={onChange('unrecognizedPrompt')}
          schema={getSchema('unrecognizedPrompt')}
          id={idSchema.unrecognizedPrompt.__id}
          value={formData.unrecognizedPrompt}
          label={formatMessage('Unrecognized Prompt')}
          formContext={props.formContext}
          rawErrors={errorSchema.unrecognizedPrompt && errorSchema.unrecognizedPrompt.__errors}
        />
      </div>
      <Validations
        onChange={onChange('validations')}
        formData={props.formData.validations || []}
        schema={getSchema('validations')}
        id={idSchema.validations.__id}
        formContext={props.formContext}
      />
      <div css={field}>
        <TextareaWidget
          onChange={onChange}
          schema={getSchema('invalidPrompt')}
          id={idSchema.invalidPrompt.__id}
          value={formData.invalidPrompt}
          label={formatMessage('Invalid Prompt')}
          formContext={props.formContext}
          rawErrors={errorSchema.invalidPrompt && errorSchema.invalidPrompt.__errors}
        />
      </div>
      <div css={field}>
        <TextareaWidget
          onChange={onChange}
          schema={getSchema('defaultValueResponse')}
          id={idSchema.defaultValueResponse.__id}
          value={formData.defaultValueResponse}
          label={formatMessage('Default value response')}
          formContext={props.formContext}
          rawErrors={errorSchema.defaultValueResponse && errorSchema.defaultValueResponse.__errors}
        />
      </div>
    </>
  );
};
