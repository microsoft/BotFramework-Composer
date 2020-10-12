// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7, SDKKinds } from '@bfc/shared';
import pickBy from 'lodash/pickBy';

interface CustomSchemaSet {
  actions?: JSONSchema7;
  triggers?: JSONSchema7;
  recognizers?: JSONSchema7;
}

type SourceSchema = { [key in SDKKinds]: JSONSchema7 };

const pickSchema = (picked$kinds: SDKKinds[], sourceSchema: SourceSchema): JSONSchema7 | undefined => {
  if (!Array.isArray(picked$kinds) || picked$kinds.length === 0) return undefined;

  const pickedSchema = picked$kinds.reduce(
    (schema, $kind) => {
      const definition = sourceSchema[$kind];
      schema.definitions = schema.definitions ?? {};
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
    } as JSONSchema7
  );

  // Sort `oneOf` list alphabetically
  pickedSchema.oneOf?.sort((a, b) => {
    return (a.$ref ?? '') < (b.$ref ?? '') ? -1 : 1;
  });

  return pickedSchema;
};

type SchemaRole = string | string[];

const roleImplementsInterface = (interfaceName: SDKKinds, $role?: SchemaRole): boolean => {
  if (typeof $role === 'string') return $role === `implements(${interfaceName})`;
  else if (Array.isArray($role)) return $role.some((x) => x === `implements(${interfaceName})`);
  return false;
};

const isActionSchema = (schema: JSONSchema7) => roleImplementsInterface(SDKKinds.IDialog, schema.$role);
const isTriggerSchema = (schema: JSONSchema7) => roleImplementsInterface(SDKKinds.ITrigger, schema.$role);
const isRecognizerSchema = (schema: JSONSchema7) =>
  roleImplementsInterface(SDKKinds.IRecognizer, schema.$role) ||
  roleImplementsInterface(SDKKinds.IEntityRecognizer, schema.$role);

export const getCustomSchema = (baseSchema?: JSONSchema7, ejectedSchema?: JSONSchema7): CustomSchemaSet => {
  if (!baseSchema || !ejectedSchema) return {};
  if (typeof baseSchema.definitions !== 'object' || typeof ejectedSchema.definitions !== 'object') return {};

  const baseDefinitions = baseSchema.definitions;
  const ejectedDefinitions = ejectedSchema.definitions ?? {};

  const baseKindHash = Object.keys(baseDefinitions).reduce((hash, $kind) => {
    hash[$kind] = true;
    return hash;
  }, {});

  const diffKinds = Object.keys(ejectedDefinitions).filter(($kind) => !baseKindHash[$kind]) as SDKKinds[];
  if (diffKinds.length === 0) return {};

  // Differentiate 'trigger' / 'recognizer' / 'action'
  const actionKinds = diffKinds.filter(($kind) => isActionSchema(ejectedDefinitions[$kind]));
  const triggerKinds = diffKinds.filter(($kind) => isTriggerSchema(ejectedDefinitions[$kind]));
  const recognizerKinds = diffKinds.filter(($kind) => isRecognizerSchema(ejectedDefinitions[$kind]));

  return pickBy(
    {
      actions: pickSchema(actionKinds, ejectedDefinitions as SourceSchema),
      triggers: pickSchema(triggerKinds, ejectedDefinitions as SourceSchema),
      recognizers: pickSchema(recognizerKinds, ejectedDefinitions as SourceSchema),
    },
    (v) => v !== undefined
  );
};
