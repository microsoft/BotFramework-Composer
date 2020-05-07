import React from 'react';
import { JSONSchema6 } from 'json-schema';
import { IChoice } from '@bfc/shared';
import { FormContext } from '../../../types';
interface ChoicesProps {
  id: string;
  schema: JSONSchema6;
  formContext: FormContext;
  formData?: IChoice;
  label: string;
  onChange: (data: IChoice) => void;
}
export declare const Choices: React.FC<ChoicesProps>;
export {};
