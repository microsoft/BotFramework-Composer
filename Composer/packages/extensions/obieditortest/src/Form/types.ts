import { WidgetProps } from '@bfdesigner/react-jsonschema-form';

import { ShellApi, LuFile, LgFile } from '../types';

export interface FormContext {
  editorSchema: any;
  shellApi: ShellApi;
  rootId: string;
  luFiles: LuFile[];
  lgFiles: LgFile[];
  dialogOptions: string[];
  dialogName: string;
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
