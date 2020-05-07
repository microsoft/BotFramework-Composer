import React from 'react';
import { IChoice } from '@bfc/shared';
import { JSONSchema6 } from 'json-schema';
import { FormContext } from '../../../types';
interface DynamicChoicesProps {
  id: string;
  formContext: FormContext;
  formData?: any;
  onChange?: (value: IChoice) => void;
  schema: JSONSchema6;
}
export declare const DynamicChoices: React.FC<DynamicChoicesProps>;
export {};
