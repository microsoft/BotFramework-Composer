// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Diagnostic, DialogInfo, LgFile, LuFile, DialogSetting, SchemaDefinitions } from '@bfc/shared';
import has from 'lodash/has';

import { JsonWalk, VisitorFunc } from '..';

import { validateExpressions } from './expressionValidation/index';
import { ValidateFunc } from './expressionValidation/types';

export const validateFuncs: { [type: string]: ValidateFunc[] } = {
  '.': [validateExpressions], //this will check all types
};

export function validateDialog(
  dialog: DialogInfo,
  schema: SchemaDefinitions,
  settings: DialogSetting,
  lgFiles: LgFile[],
  luFiles: LuFile[]
): Diagnostic[] {
  const { id, content } = dialog;
  try {
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
          const result = func(path, value, value.$kind, schema.definitions[value.$kind], settings, lgFiles, luFiles);
          if (result) {
            diagnostics.splice(0, 0, ...result);
          }
        });
      }
      return false;
    };
    JsonWalk(id, content, visitor);
    return diagnostics.map((e) => {
      e.source = id;
      return e;
    });
  } catch (error) {
    return [new Diagnostic(error.message, id)];
  }
}

export function validateDialogs(
  dialogs: DialogInfo[],
  schema: SchemaDefinitions,
  lgFiles: LgFile[],
  luFiles: LuFile[],
  settings: DialogSetting
): { [id: string]: Diagnostic[] } {
  const diagnosticsMap = {};
  dialogs.forEach((dialog) => {
    diagnosticsMap[dialog.id] = validateDialog(dialog, schema, settings, lgFiles, luFiles);
  });

  return diagnosticsMap;
}
