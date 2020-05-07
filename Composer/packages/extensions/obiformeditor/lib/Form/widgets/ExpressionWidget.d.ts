import React from 'react';
import { ITextFieldProps, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import { JSONSchema6 } from 'json-schema';
import { FormContext } from '../types';
interface ExpresionWidgetProps extends ITextFieldProps {
  hiddenErrMessage?: boolean;
  onValidate?: (err?: JSX.Element | string) => void;
  formContext: FormContext;
  rawErrors?: string[];
  schema: JSONSchema6;
  onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
  /** Set to true to display as inline text that is editable on hover */
  editable?: boolean;
  styles?: Partial<ITextFieldStyles>;
  options?: any;
}
export declare const ExpressionWidget: React.FC<ExpresionWidgetProps>;
export {};
