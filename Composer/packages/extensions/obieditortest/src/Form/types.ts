import { WidgetProps } from '@bfdesigner/react-jsonschema-form';

import { ShellApi } from '../types';

export interface FormContext {
  editorSchema: any;
  shellApi: ShellApi;
  rootId: string;
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

export interface OBISchema {
  $role?: string;
}

declare module 'json-schema' {
  interface JSONSchema6 extends OBISchema {
    title?: string;
    __additional_property?: boolean;
  }
}
