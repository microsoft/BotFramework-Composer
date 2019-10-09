import React from 'react';
import { FieldProps, IdSchema } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';

import { PromptFieldChangeHandler, GetSchema } from '../types';
import { CheckboxWidget } from '../../../widgets';
import { field } from '../styles';

import { Choices } from './Choices';
import { ChoiceOptions } from './ChoiceOptions';

interface ChoiceInputSettingsProps extends FieldProps<ChoiceInput> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const ChoiceInputSettings: React.FC<ChoiceInputSettingsProps> = props => {
  const { getSchema, formData, idSchema, onChange, formContext } = props;

  const updateChoiceOptions = (field: keyof IChoiceOption) => (data: any) => {
    const updater = onChange('choiceOptions');
    updater({ ...formData.choiceOptions, [field]: data });
  };

  const recognizerOptionsSchema = getSchema('recognizerOptions');

  return (
    <>
      <Choices
        formData={formData.choices}
        schema={getSchema('choices')}
        onChange={onChange('choices')}
        id={idSchema.choices && idSchema.choices.__id}
        label={formatMessage('Choice Options')}
      />
      <ChoiceOptions
        schema={getSchema('choiceOptions')}
        idSchema={idSchema.choiceOptions as IdSchema}
        onChange={updateChoiceOptions}
        formData={formData.choiceOptions || {}}
        formContext={formContext}
      />
      <div css={field}>
        <CheckboxWidget
          onChange={onChange('appendChoices')}
          schema={getSchema('appendChoices')}
          id={idSchema.appendChoices && idSchema.appendChoices.__id}
          value={formData.appendChoices}
          label={formatMessage('Append choices')}
          formContext={formContext}
        />
      </div>
      <div css={field}>
        <CheckboxWidget
          onChange={data => onChange('recognizerOptions')({ noValue: data })}
          schema={recognizerOptionsSchema.properties ? (recognizerOptionsSchema.properties.noValue as JSONSchema6) : {}}
          id={idSchema.recognizerOptions && idSchema.recognizerOptions.__id}
          value={formData.recognizerOptions}
          label={formatMessage('Recognizer options: no value')}
          formContext={formContext}
        />
      </div>
    </>
  );
};
