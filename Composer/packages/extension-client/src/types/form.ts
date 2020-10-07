// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7, SchemaDefinitions } from '@bfc/types';
import React from 'react';

import { UIOptions } from './formSchema';

export type FormErrors = {
  [key: string]: string | FormErrors;
};

export type ChangeHandler<T = any> = (newValue?: T) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FieldProps<T = any> {
  className?: string;
  definitions: SchemaDefinitions | undefined;
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
