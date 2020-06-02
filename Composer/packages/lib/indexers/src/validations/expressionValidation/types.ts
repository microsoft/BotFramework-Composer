// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Diagnostic, LgFile, LuFile } from '@bfc/shared';

export enum ExpressionType {
  number = 'number',
  integer = 'integer',
  boolean = 'boolean',
  string = 'string',
  array = 'array',
}

export type ValidateFunc = (
  path: string,
  value: any,
  type: string,
  schema: any,
  lgFiles: LgFile[],
  luFiles: LuFile[]
) => Diagnostic[] | null; // error msg

export type ExpressionProperty = {
  value: string | boolean | number;
  required: boolean; //=true, the value is required in dialog
  path: string; //the json path of the value
  types: string[]; //supported expression type of the value
};
