import React from 'react';
import { FieldProps, IdSchema } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { ConfirmInput, IChoiceOption } from 'shared';

import { PromptFieldChangeHandler, GetSchema } from './types';
import { Choices } from './ChoiceInput/Choices';
import { ChoiceOptions } from './ChoiceInput/ChoiceOptions';

interface ConfirmInputSettingsProps extends FieldProps<ConfirmInput> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const ConfirmInputSettings: React.FC<ConfirmInputSettingsProps> = props => {
  const { getSchema, formData, idSchema, onChange, formContext } = props;

  const updateChoiceOptions = (field: keyof IChoiceOption) => (data: any) => {
    const updater = onChange('choiceOptions');
    updater({ ...formData.choiceOptions, [field]: data });
  };

  return (
    <>
      <Choices
        formData={formData.confirmChoices}
        schema={getSchema('confirmChoices')}
        onChange={onChange('confirmChoices')}
        id={idSchema.confirmChoices && idSchema.confirmChoices.__id}
        label={formatMessage('Confirm Options')}
      />
      <ChoiceOptions
        schema={getSchema('choiceOptions')}
        idSchema={idSchema.choiceOptions as IdSchema}
        onChange={updateChoiceOptions}
        formData={formData.choiceOptions || {}}
        formContext={formContext}
      />
    </>
  );
};
