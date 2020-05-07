import React from 'react';
import { IdSchema } from '@bfcomposer/react-jsonschema-form';
import { IChoiceOption, OBISchema } from '@bfc/shared';
import { FormContext } from '../../../types';
interface ChoiceOptionsProps {
  idSchema: IdSchema;
  schema: OBISchema;
  formData: IChoiceOption;
  onChange: (field: keyof IChoiceOption) => (data: any) => void;
  formContext: FormContext;
}
export declare const ChoiceOptions: React.FC<ChoiceOptionsProps>;
export {};
