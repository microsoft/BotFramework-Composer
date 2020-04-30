// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { OBISchema, DefinitionSummary } from '@bfc/shared';
import { JSONSchema7 } from '@bfc/extension';

type SchemaDefinitionSet = { [$kind: string]: JSONSchema7 };

export const mergeSchemas = (builtinSdkSchema?: OBISchema, customSchemas?: OBISchema[]): OBISchema => {
  if (!builtinSdkSchema) return {};
  if (!Array.isArray(customSchemas) || customSchemas.length === 0) return builtinSdkSchema;

  // merge sdk.schema with custom schema files.
  const sdkOneof: DefinitionSummary[] = get(builtinSdkSchema, 'oneOf', []);
  const sdkDefinitions: SchemaDefinitionSet = get(builtinSdkSchema, 'definitions', {});

  const customOneofList: DefinitionSummary[][] = customSchemas.map(x => x.oneOf || []) || [];
  const customDefinitionsList: SchemaDefinitionSet[] = customSchemas.map(x => x.definitions || {}) || [];

  const mergedOneof = customOneofList.reduce(
    (result, currentOneof) => {
      result.push(...currentOneof);
      return result;
    },
    [...sdkOneof]
  );
  const mergedDefinitionSet = customDefinitionsList.reduce(
    (result, currentDefSet) => {
      // TODO: handle the case that custom schemas overrides each other
      return {
        ...result,
        ...currentDefSet,
      };
    },
    { ...sdkDefinitions }
  );

  return {
    ...builtinSdkSchema,
    oneOf: mergedOneof,
    definitions: mergedDefinitionSet,
  };
};
