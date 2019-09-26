import React from 'react';
import get from 'lodash.get';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';

import { TextareaWidget } from '../../widgets';

const getSchema = (schema: JSONSchema6, field: keyof MicrosoftInputDialog): JSONSchema6 => {
  const fieldSchema = get(schema, ['properties', field]);

  return fieldSchema;
};

export const Exceptions: React.FC<FieldProps<MicrosoftInputDialog>> = props => {
  const { onChange, schema, idSchema, formData, errorSchema, ...rest } = props;

  const handleChange = (field: keyof MicrosoftInputDialog) => (data: any) => {
    if (onChange) {
      onChange({ ...props.formData, [field]: data });
    }
  };

  return (
    <>
      <TextareaWidget
        {...rest}
        onChange={handleChange}
        schema={getSchema(schema, 'unrecognizedPrompt')}
        id={idSchema.unrecognizedPrompt.__id}
        value={formData.unrecognizedPrompt}
        label={formatMessage('Unrecognized Prompt')}
        formContext={props.formContext}
        rawErrors={errorSchema.unrecognizedPrompt && errorSchema.unrecognizedPrompt.__errors}
        options={{}}
        onFocus={() => {}}
        onBlur={() => {}}
      />
    </>
  );
};
