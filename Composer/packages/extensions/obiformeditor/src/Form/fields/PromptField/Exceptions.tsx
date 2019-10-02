import React from 'react';
import get from 'lodash.get';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';

import { TextareaWidget } from '../../widgets';

import { Validations } from './Validations';
import { field } from './styles';

const getSchema = (schema: JSONSchema6, field: keyof MicrosoftInputDialog): JSONSchema6 => {
  const fieldSchema = get(schema, ['properties', field]);

  return fieldSchema;
};

export const Exceptions: React.FC<FieldProps<MicrosoftInputDialog>> = props => {
  const { onChange, schema, idSchema, formData, errorSchema } = props;

  const handleChange = (field: keyof MicrosoftInputDialog) => (data: any) => {
    if (onChange) {
      onChange({ ...props.formData, [field]: data });
    }
  };

  return (
    <>
      <div css={field}>
        <TextareaWidget
          onChange={handleChange}
          schema={getSchema(schema, 'unrecognizedPrompt')}
          id={idSchema.unrecognizedPrompt.__id}
          value={formData.unrecognizedPrompt}
          label={formatMessage('Unrecognized Prompt')}
          formContext={props.formContext}
          rawErrors={errorSchema.unrecognizedPrompt && errorSchema.unrecognizedPrompt.__errors}
        />
      </div>
      <Validations
        onChange={handleChange('validations')}
        formData={props.formData.validations || []}
        schema={getSchema(schema, 'validations')}
        id={idSchema.validations.__id}
        formContext={props.formContext}
      />
      <div css={field}>
        <TextareaWidget
          onChange={handleChange}
          schema={getSchema(schema, 'invalidPrompt')}
          id={idSchema.invalidPrompt.__id}
          value={formData.invalidPrompt}
          label={formatMessage('Invalid Prompt')}
          formContext={props.formContext}
          rawErrors={errorSchema.invalidPrompt && errorSchema.invalidPrompt.__errors}
        />
      </div>
      <div css={field}>
        <TextareaWidget
          onChange={handleChange}
          schema={getSchema(schema, 'defaultValueResponse')}
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
