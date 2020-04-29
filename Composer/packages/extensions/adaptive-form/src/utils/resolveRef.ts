// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7, JSONSchema7Definition } from '@bfc/extension';

export function resolveRef(
  schema: JSONSchema7 = {},
  definitions: { [key: string]: JSONSchema7Definition } = {}
): JSONSchema7 {
  if (typeof schema?.$ref === 'string') {
    const defName = schema.$ref.replace('#/definitions/', '');
    const defSchema = (typeof definitions[defName] === 'object' ? definitions[defName] : {}) as object;

    const resolvedSchema = {
      ...defSchema,
      ...schema,
    } as JSONSchema7;
    delete resolvedSchema.$ref;

    return resolvedSchema;
  }

  return schema;
}
