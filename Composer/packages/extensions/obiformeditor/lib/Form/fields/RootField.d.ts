import React from 'react';
import { JSONSchema6 } from 'json-schema';
import { FormContext } from '../types';
interface RootFieldProps {
  description?: string;
  formContext: FormContext;
  formData: any;
  id: string;
  name?: string;
  onChange?: (data: any) => void;
  schema: JSONSchema6;
  title?: string;
  showMetadata?: boolean;
}
export declare const RootField: React.FC<RootFieldProps>;
export {};
