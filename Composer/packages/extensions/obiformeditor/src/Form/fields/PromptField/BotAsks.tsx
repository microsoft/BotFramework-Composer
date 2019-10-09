import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';

import { TextareaWidget } from '../../widgets';

import { GetSchema, PromptFieldChangeHandler } from './types';

interface BotAsksProps extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const BotAsks: React.FC<BotAsksProps> = props => {
  const { onChange, getSchema, idSchema, formData, formContext } = props;

  return (
    <>
      <TextareaWidget
        onChange={onChange('prompt')}
        schema={getSchema('prompt')}
        id={idSchema.prompt.__id}
        value={formData.prompt}
        label={formatMessage('Prompt')}
        formContext={formContext}
      />
    </>
  );
};
