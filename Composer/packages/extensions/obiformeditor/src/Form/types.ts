import { WidgetProps, FieldProps, ObjectFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import { JSONSchema6 } from 'json-schema';

import { ShellApi, LuFile, LgFile, DialogInfo } from '../types';

export interface FormContext {
  editorSchema: any;
  shellApi: ShellApi;
  rootId: string;
  luFiles: LuFile[];
  lgFiles: LgFile[];
  dialogOptions: { value: string; label: string }[];
  currentDialog: DialogInfo;
  dialogId?: string;
  isRoot: boolean;
}

interface EnumOption {
  label: string;
  value: string;
}

export interface BFDObjectFieldTemplateProps extends ObjectFieldTemplateProps {
  id: string;
  onChange: (any) => void;
}

export interface BFDFieldProps extends FieldProps {
  formContext: FormContext;
}

export interface BFDWidgetProps extends Partial<WidgetProps> {
  id: string;
  schema: JSONSchema6;
  onChange: (data: any) => void;
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
