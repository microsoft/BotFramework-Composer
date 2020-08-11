// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7, JSONSchema7Definition } from '@bfc/extension';

export const getDefinitions = (expressions: JSONSchema7[] = [], definitions: { [key: string]: JSONSchema7 }) =>
  expressions.reduce((acc: { [key: string]: JSONSchema7Definition }, schema: any) => {
    const defName = (schema?.$ref || '').replace('#/definitions/', '');
    const defSchema = definitions?.[defName] as JSONSchema7;

    if (!defSchema || typeof defSchema !== 'object' || acc[defName]) {
      return acc;
    }

    const nestedRefs = getDefinitions(defSchema.oneOf as any, definitions);

    return { ...acc, ...nestedRefs, [defName]: defSchema };
  }, {});
