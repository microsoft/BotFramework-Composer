// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import React from 'react';

import { UIOptions } from './formSchema';

declare module 'json-schema' {
  interface JSONSchema7 {
    $copy?: string;
    $id?: string;
    $kind?: string;
    $role?: string;
    $designer?: {
      id: string;
      [key: string]: any;
    };
  }
}

export interface SchemaDefinitions {
  [key: string]: JSONSchema7Definition;
}

// Re-export monkey patched json schema interfaces
export { JSONSchema7, JSONSchema7Definition };

export type FormErrors = {
  [key: string]: string | FormErrors;
};

export type ChangeHandler<T = any> = (newValue?: T) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FieldProps<T = any> {
  className?: string;
  definitions: { [key: string]: JSONSchema7Definition } | undefined;
  depth: number;
  description?: string;
  disabled?: boolean;
  enumOptions?: string[];
  error?: string | JSX.Element;
  hidden?: boolean;
  hideError?: boolean;
  id: string;
  label?: string | false;
  name: string;
  placeholder?: string;
  rawErrors?: FormErrors | string | string[] | FormErrors[];
  readonly?: boolean;
  schema: JSONSchema7;
  required?: boolean;
  transparentBorder?: boolean;
  uiOptions: UIOptions;
  value?: T;

  onChange: ChangeHandler<T>;
  onFocus?: (id: string, value?: T) => void;
  onBlur?: (id: string, value?: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldWidget<T = any> = React.FC<FieldProps<T>>;
