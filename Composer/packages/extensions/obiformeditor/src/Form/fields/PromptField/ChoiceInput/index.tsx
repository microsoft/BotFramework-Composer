import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';

import { PromptFieldChangeHandler, GetSchema } from '../types';

import { Choices } from './Choices';

interface ChoiceInputSettingsProps extends FieldProps<ChoiceInput> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const ChoiceInputSettings: React.FC<ChoiceInputSettingsProps> = props => {
  const { getSchema, formData, idSchema, onChange } = props;

  return (
    <>
      <Choices
        formData={formData.choices}
        schema={getSchema('choices')}
        onChange={onChange('choices')}
        id={idSchema.choices && idSchema.choices.__id}
      />
    </>
  );
};
