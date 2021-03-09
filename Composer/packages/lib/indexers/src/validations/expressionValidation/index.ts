// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { MicrosoftIDialog, Diagnostic, LgFile, DialogSetting, DiagnosticSeverity, LuFile } from '@bfc/shared';
import { SchemaDefinitions } from '@bfc/shared/lib/schemaUtils/types';

import { extractOptionByKey } from '../../utils/lgUtil';

import { searchExpressions } from './searchExpression';
import { ExpressionParseResult, ValidateFunc } from './types';
import { checkExpression, checkReturnType, filterCustomFunctionError } from './validation';

const NamespaceKey = '@namespace';
const ExportsKey = '@exports';

export const searchLgCustomFunction = (lgFiles: LgFile[]): string[] => {
  const customFunctions = lgFiles.reduce((result: string[], lgFile) => {
    const { options } = lgFile;
    if (options?.length) {
      const exports = extractOptionByKey(ExportsKey, options);
      let namespace = extractOptionByKey(NamespaceKey, options);
      if (!namespace) namespace = lgFile.id; //if namespace doesn't exist, use file name
      const funcList = exports.split(',');
      funcList.forEach((func) => {
        if (func) {
          result.push(`${namespace}.${func.trim()}`);
        }
      });
    }
    return result;
  }, []);
  return customFunctions;
};

export const validateExpressions: ValidateFunc = (
  path: string,
  value: MicrosoftIDialog,
  type: string,
  schema: SchemaDefinitions,
  settings: DialogSetting,
  lgFiles: LgFile[],
  luFiles: LuFile[],
  cache?: ExpressionParseResult
) => {
  const expressions = searchExpressions(path, value, type, schema);
  const customFunctions = searchLgCustomFunction(lgFiles).concat(settings.customFunctions);
  const newCache = {};
  const diagnostics = expressions.reduce((diagnostics: Diagnostic[], expression) => {
    const { required, path, types, value } = expression;
    let errorMessage = '';
    let warningMessage = '';
    try {
      newCache[value] = cache?.[value] ? cache[value] : checkExpression(value, required);
      errorMessage = checkReturnType(newCache[value], types);
    } catch (error) {
      //change the missing custom function error to warning
      warningMessage = filterCustomFunctionError(error.message, customFunctions);
    }

    if (errorMessage) diagnostics.push(new Diagnostic(errorMessage, '', DiagnosticSeverity.Error, path));
    if (warningMessage) diagnostics.push(new Diagnostic(errorMessage, '', DiagnosticSeverity.Warning, path));

    return diagnostics;
  }, []);
  return { diagnostics, cache: newCache };
};
