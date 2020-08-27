// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7, JSONSchema7Definition } from '@bfc/extension';
import formatMessage from 'format-message';

export function resolveRef(
  schema: JSONSchema7 = {},
  definitions: { [key: string]: JSONSchema7Definition } = {}
): JSONSchema7 {
  if (typeof schema?.$ref === 'string') {
    if (!schema?.$ref?.startsWith('#/definitions/')) {
      return schema;
    }

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
  } else if (typeof schema.additionalProperties === 'object' && typeof schema.additionalProperties.$ref === 'string') {
    const additionalProperties = resolveRef(schema.additionalProperties, definitions);
    const resolvedSchema = {
      ...schema,
      additionalProperties,
    } as JSONSchema7;

    return resolvedSchema;
  } else if (
    typeof schema.items === 'object' &&
    !Array.isArray(schema.items) &&
    typeof schema.items.$ref === 'string'
  ) {
    const { $ref, ...rest } = schema.items;
    const items = resolveRef(schema.items, definitions);
    const resolvedSchema = {
      ...schema,
      items: {
        ...items,
        ...rest,
      },
    } as JSONSchema7;

    return resolvedSchema;
  }

  return schema;
}
