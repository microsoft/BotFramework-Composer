import { WidgetProps, FieldProps } from '@bfdesigner/react-jsonschema-form';

import { ShellApi, LuFile, LgFile } from '../types';

export interface FormContext {
  editorSchema: any;
  shellApi: ShellApi;
  rootId: string;
  luFiles: LuFile[];
  lgFiles: LgFile[];
  dialogOptions: string[];
  dialogName: string;
  dialogId?: string;
}

interface EnumOption {
  label: string;
  value: string;
}

export interface BFDFieldProps extends FieldProps {
  formContext: FormContext;
}

export interface BFDWidgetProps extends WidgetProps {
  formContext: FormContext;
  options: {
    label?: string | false;
    enumOptions?: EnumOption[];
  };
}

export interface SelectWidgetProps extends BFDWidgetProps {
  options: {
    enumOptions: EnumOption[];
  };
}

export interface RadioWidgetProps extends BFDWidgetProps {
  options: {
    enumOptions: EnumOption[];
  };
}
