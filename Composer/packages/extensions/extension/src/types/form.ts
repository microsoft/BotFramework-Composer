// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema4 } from 'json-schema';
import React from 'react';

import { UIOptions } from './uiSchema';

export type FormErrors = {
  [key: string]: string | FormErrors;
};

export type ChangeHandler<T = any> = (newValue?: T) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FieldProps<T = any> {
  className?: string;
  definitions?: { [key: string]: JSONSchema4 };
  depth: number;
  description?: string;
  disabled?: boolean;
  enumOptions?: string[];
  error?: string | JSX.Element;
  hideError?: boolean;
  id: string;
  label?: string | false;
  name: string;
  placeholder?: string;
  rawErrors?: FormErrors | string | string[] | FormErrors[];
  readonly?: boolean;
  schema: JSONSchema4;
  transparentBorder?: boolean;
  uiOptions: UIOptions;
  value?: T;

  onChange: ChangeHandler<T>;
  onFocus?: (id: string, value?: T) => void;
  onBlur?: (id: string, value?: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldWidget<T = any> = React.FC<FieldProps<T>>;
