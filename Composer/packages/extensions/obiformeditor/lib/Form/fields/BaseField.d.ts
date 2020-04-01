import React from 'react';
import { JSONSchema6 } from 'json-schema';
import { IdSchema, UiSchema } from '@bfcomposer/react-jsonschema-form';
import { FormContext } from '../types';
import './styles.css';
interface BaseFieldProps<T> {
  children?: React.ReactNode;
  className?: string;
  description?: string;
  formContext: FormContext;
  formData: T;
  idSchema: IdSchema;
  name?: string;
  onChange?: (data: T) => void;
  schema: JSONSchema6;
  title?: string;
  uiSchema: UiSchema;
}
export declare function BaseField<T = any>(props: BaseFieldProps<T>): JSX.Element;
export declare namespace BaseField {
  var defaultProps: {
    formContext: {};
    uiSchema: {};
  };
}
export {};
//# sourceMappingURL=BaseField.d.ts.map
