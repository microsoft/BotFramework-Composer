// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Diagnostic, LgFile, LuFile, DialogSetting, SchemaDefinitions, MicrosoftIDialog } from '@bfc/shared';
import { ReturnType } from 'adaptive-expressions';

//this is used to change the type like 'integer', 'boolean' to expression parse return type
//the expression return type is number and can do bitwise to check if the type is match.
export const StringMapExpressionType = {
  number: ReturnType.Number,
  string: ReturnType.String,
  boolean: ReturnType.Boolean,
  object: ReturnType.Object,
  array: ReturnType.Array,
  integer: ReturnType.Number,
  all: ReturnType.Number + ReturnType.String + ReturnType.Boolean + ReturnType.Object + ReturnType.Array,
};

export type ExpressionParseResult = { [content: string]: number };

export type ValidateFunc = (
  path: string,
  value: MicrosoftIDialog,
  type: string,
  schema: SchemaDefinitions,
  setting: DialogSetting,
  lgFiles: LgFile[],
  luFiles: LuFile[],
  cache?: ExpressionParseResult
) => { diagnostics: Diagnostic[] | null; cache: ExpressionParseResult }; // error msg

export type ExpressionProperty = {
  value: any;
  required: boolean; //=true, the value is required in dialog
  path: string; //the json path of the value
  types: number[]; //supported expression type of the value
};
