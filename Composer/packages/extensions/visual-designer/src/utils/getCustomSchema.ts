// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OBISchema } from '@bfc/shared';

export const getCustomSchema = (baseSchema?: OBISchema, ejectedSchema?: OBISchema): OBISchema | undefined => {
  if (!baseSchema || !ejectedSchema) return;

  const baseDefinitions = baseSchema.definitions;
  const baseKindHash = Object.keys(baseDefinitions).reduce((hash, $kind) => {
    hash[$kind] = true;
    return hash;
  }, {});

  const ejectedDefinitions = ejectedSchema.definitions;
  const diffKinds = Object.keys(ejectedDefinitions).filter($kind => !baseKindHash[$kind]);
  if (diffKinds.length === 0) return;

  const diffSchema = diffKinds.reduce(
    (schema, $kind) => {
      const definition = ejectedDefinitions[$kind];
      schema.definitions[$kind] = definition;
      schema.oneOf?.push({
        title: definition.title || $kind,
        description: definition.description || '',
        $ref: `#/definitions/${$kind}`,
      });
      return schema;
    },
    {
      oneOf: [],
      definitions: {},
    } as OBISchema
  );

  return diffSchema;
};
