import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';

import { TextareaWidget } from '../../widgets';

interface BotAsksProps extends FieldProps<MicrosoftInputDialog> {
  onChange: (field: keyof MicrosoftInputDialog) => (data: any) => void;
  getSchema: (field: keyof MicrosoftInputDialog) => JSONSchema6;
}

export const BotAsks: React.FC<BotAsksProps> = props => {
  const { onChange, getSchema, idSchema, formData, formContext } = props;

  const promptSchema = getSchema('prompt');

  if (!promptSchema) {
    return null;
  }

  return (
    <TextareaWidget
      onChange={onChange('prompt')}
      schema={promptSchema}
      id={idSchema.prompt.__id}
      value={formData.prompt}
      label={formatMessage('Prompt')}
      formContext={formContext}
    />
  );
};
