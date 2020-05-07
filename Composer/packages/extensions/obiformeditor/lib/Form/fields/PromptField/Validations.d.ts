import React from 'react';
import { JSONSchema6 } from 'json-schema';
import { FormContext } from '../../types';
interface ValidationsProps {
  onChange: (newData: string[]) => void;
  formData: string[];
  schema: JSONSchema6;
  id: string;
  formContext: FormContext;
}
export declare const Validations: React.FC<ValidationsProps>;
export {};
