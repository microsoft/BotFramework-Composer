import React from 'react';
import { ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
interface EditableFieldProps extends ITextFieldProps {
  onChange: (e: any, newTitle?: string) => void;
  placeholder?: string;
  fontSize?: string;
  options?: any;
}
export declare const EditableField: React.FC<EditableFieldProps>;
export {};
