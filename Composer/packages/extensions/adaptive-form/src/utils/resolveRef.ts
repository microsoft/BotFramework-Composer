// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema4 } from 'json-schema';

export function resolveRef(schema: JSONSchema4 = {}, definitions: { [key: string]: JSONSchema4 } = {}): JSONSchema4 {
  if (typeof schema?.$ref === 'string') {
    const defName = schema.$ref.replace('#/definitions/', '');

    const resolvedSchema = {
      ...definitions?.[defName],
      ...schema,
    };
    delete resolvedSchema.$ref;

    return resolvedSchema;
  }

  return schema;
}
