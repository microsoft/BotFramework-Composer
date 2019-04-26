import { WidgetProps } from 'react-jsonschema-form';

import { ShellApi } from '../types';

export interface FormContext {
  shellApi: ShellApi;
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
