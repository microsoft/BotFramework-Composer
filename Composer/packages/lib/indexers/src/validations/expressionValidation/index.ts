// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { MicrosoftIDialog, Diagnostic, LgFile, LuFile } from '@bfc/shared';
import { SchemaDefinitions } from '@bfc/shared/lib/schemaUtils/types';

import { extractOptionByKey } from '../../utils/lgUtil';

import { searchExpressions } from './searchExpression';
import { ValidateFunc } from './types';
import { validate } from './validation';

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
  lgFiles: LgFile[],
  luFiles: LuFile[]
) => {
  const expressions = searchExpressions(path, value, type, schema);
  const customFunctions = searchLgCustomFunction(lgFiles);

  const diagnostics = expressions.reduce((diagnostics: Diagnostic[], expression) => {
    const diagnostic = validate(expression, customFunctions);
    if (diagnostic) diagnostics.push(diagnostic);
    return diagnostics;
  }, []);

  return diagnostics;
};
