// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Diagnostic, DialogInfo, LgFile, LuFile, DialogSetting, SchemaDefinitions } from '@bfc/shared';
import has from 'lodash/has';

import { JsonWalk, VisitorFunc } from '..';

import { validateExpressions } from './expressionValidation/index';
import { ExpressionParseResult, ValidateFunc } from './expressionValidation/types';

export const validateFuncs: { [type: string]: ValidateFunc[] } = {
  '.': [validateExpressions], //this will check all types
};

export function validateDialog(
  dialog: DialogInfo,
  schema: SchemaDefinitions,
  settings: DialogSetting,
  lgFiles: LgFile[],
  luFiles: LuFile[],
  cache?: ExpressionParseResult
): { diagnostics: Diagnostic[] | null; cache?: ExpressionParseResult } {
  const { id, content } = dialog;
  try {
    const diagnostics: Diagnostic[] = [];
    let newCache: ExpressionParseResult = {};
    /**
     *
     * @param path , jsonPath string
     * @param value , current node value    *
     * @return boolean, true to stop walk
     * */
    const visitor: VisitorFunc = (path: string, value: any): boolean => {
      if (has(value, '$kind') && value.$kind) {
        const allChecks = [...validateFuncs['.']];
        const checkerFunc = validateFuncs[value.$kind];
        if (checkerFunc) {
          allChecks.splice(0, 0, ...checkerFunc);
        }

        allChecks.forEach((func) => {
          const result = func(
            path,
            value,
            value.$kind,
            schema.definitions[value.$kind],
            settings,
            lgFiles,
            luFiles,
            cache
          );
          if (result.diagnostics) {
            diagnostics.push(...result.diagnostics);
          }
          newCache = { ...newCache, ...result.cache };
        });
      }
      return false;
    };
    JsonWalk(id, content, visitor);
    return {
      diagnostics: diagnostics.map((e) => {
        e.source = id;
        return e;
      }),
      cache: newCache,
    };
  } catch (error) {
    return { diagnostics: [new Diagnostic(error.message, id)], cache };
  }
}
