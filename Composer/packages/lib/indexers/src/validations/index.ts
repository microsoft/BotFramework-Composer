// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Diagnostic, MicrosoftIDialog, DialogInfo, LgFile, LuFile } from '@bfc/shared';
import { SchemaDefinitions } from '@bfc/shared/lib/schemaUtils/types';
import has from 'lodash/has';

import { JsonWalk, VisitorFunc } from '..';

import { validateExpressions } from './expressionValidation/index';
import { ValidateFunc } from './expressionValidation/types';

export const validateFuncs: { [type: string]: ValidateFunc[] } = {
  '.': [validateExpressions], //this will check all types
};

// check all fields
function validateFields(
  dialog: MicrosoftIDialog,
  id: string,
  schema: any,
  lgFiles: LgFile[],
  luFiles: LuFile[]
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  /**
   *
   * @param path , jsonPath string
   * @param value , current node value    *
   * @return boolean, true to stop walk
   * */
  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    if (has(value, '$kind')) {
      const allChecks = [...validateFuncs['.']];
      const checkerFunc = validateFuncs[value.$kind];
      if (checkerFunc) {
        allChecks.splice(0, 0, ...checkerFunc);
      }

      allChecks.forEach((func) => {
        const result = func(path, value, value.$kind, schema.definitions[value.$kind], lgFiles, luFiles);
        if (result) {
          diagnostics.splice(0, 0, ...result);
        }
      });
    }
    return false;
  };
  JsonWalk(id, dialog, visitor);
  return diagnostics.map((e) => {
    e.source = id;
    return e;
  });
}

export function validateDialog(
  dialog: DialogInfo,
  schema: SchemaDefinitions,
  lgFiles: LgFile[],
  luFiles: LuFile[]
): Diagnostic[] {
  const { id, content } = dialog;
  try {
    return validateFields(content, id, schema, lgFiles, luFiles);
  } catch (error) {
    return [new Diagnostic(error.message, id)];
  }
}

export function validateDialogs(
  dialogs: DialogInfo[],
  lgFiles: LgFile[],
  luFiles: LuFile[],
  schema: SchemaDefinitions
): { [id: string]: Diagnostic[] } {
  const diagnosticsMap = {};
  dialogs.forEach((dialog) => {
    diagnosticsMap[dialog.id] = validateDialog(dialog, schema, lgFiles, luFiles);
  });

  return diagnosticsMap;
}
