import React from 'react';
import get from 'lodash.get';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';

import { TextareaWidget } from '../../widgets';

export const BotAsks: React.FC<FieldProps<MicrosoftInputDialog>> = props => {
  const { onChange, schema, idSchema, formData } = props;

  const promptSchema = get(schema, 'properties.prompt');

  if (!promptSchema) {
    return null;
  }

  const handleChange = (data: any) => {
    if (onChange) {
      onChange({ ...props.formData, prompt: data });
    }
  };

  return (
    // @ts-ignore
    <TextareaWidget
      onChange={handleChange}
      schema={promptSchema}
      id={idSchema.prompt.__id}
      value={formData.prompt}
      label={formatMessage('Prompt')}
    />
  );
};
