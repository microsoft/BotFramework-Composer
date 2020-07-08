// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7, JSONSchema7Definition } from '@bfc/extension';
import formatMessage from 'format-message';

export function resolveRef(
  schema: JSONSchema7 = {},
  definitions: { [key: string]: JSONSchema7Definition } = {}
): JSONSchema7 {
  if (typeof schema?.$ref === 'string') {
    const defName = schema.$ref.replace('#/definitions/', '');
    const defSchema = definitions?.[defName] as JSONSchema7;

    if (!defSchema || typeof defSchema !== 'object') {
      throw new Error(formatMessage('Missing definition for {defName}', { defName }));
    }

    const resolvedSchema = {
      ...defSchema,
      ...schema,
    } as JSONSchema7;
    delete resolvedSchema.$ref;

    return resolvedSchema;
  }

  return schema;
}
