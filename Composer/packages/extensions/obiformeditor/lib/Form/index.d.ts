import React from 'react';
import { UiSchema, FormProps as JSONFormProps } from '@bfcomposer/react-jsonschema-form';
import { JSONSchema6 } from 'json-schema';
import { FormContext } from './types';
import './styles.css';
interface FormProps extends JSONFormProps<object> {
  children: React.ReactChild;
  formContext: FormContext;
  formData: object;
  onBlur?: () => void;
  onChange?: (formData: object) => void;
  schema: JSONSchema6;
  uiSchema: UiSchema;
}
declare const Form: React.FunctionComponent<FormProps>;
export default Form;
