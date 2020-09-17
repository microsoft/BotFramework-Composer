// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Diagnostic, LgFile, LuFile } from '@bfc/shared';
import { ReturnType } from 'adaptive-expressions';

export const StringMapExpressionType = {
  number: ReturnType.Number,
  string: ReturnType.String,
  boolean: ReturnType.Boolean,
  object: ReturnType.Object,
  array: ReturnType.Array,
  integer: ReturnType.Number,
};

export type ValidateFunc = (
  path: string,
  value: any,
  type: string,
  schema: any,
  lgFiles: LgFile[],
  luFiles: LuFile[]
) => Diagnostic[] | null; // error msg

export type ExpressionProperty = {
  value: any;
  required: boolean; //=true, the value is required in dialog
  path: string; //the json path of the value
  types: number[]; //supported expression type of the value
};
