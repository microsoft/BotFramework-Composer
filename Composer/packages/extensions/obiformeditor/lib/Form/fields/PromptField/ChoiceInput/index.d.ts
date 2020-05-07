import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { ChoiceInput } from '@bfc/shared';
import { PromptFieldChangeHandler, GetSchema } from '../types';
import { FormContext } from '../../../types';
interface ChoiceInputSettingsProps extends FieldProps<ChoiceInput> {
  formContext: FormContext;
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}
export declare const ChoiceInputSettings: React.FC<ChoiceInputSettingsProps>;
export {};
