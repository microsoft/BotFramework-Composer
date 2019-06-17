import { WidgetProps } from '@bfdesigner/react-jsonschema-form';

import { ShellApi, LuFile } from '../types';

export interface FormContext {
  editorSchema: any;
  shellApi: ShellApi;
  rootId: string;
  luFiles: LuFile[];
  lgFiles: any;
  dialogOptions: string[];
  dialogName: string;
  getDialogId: any;
}

interface EnumOption {
  label: string;
  value: string;
}

export interface SelectWidgetProps extends WidgetProps {
  options: {
    enumOptions: EnumOption[];
  };
}

export interface RadioWidgetProps extends WidgetProps {
  options: {
    enumOptions: EnumOption[];
  };
}
