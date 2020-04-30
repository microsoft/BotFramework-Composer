// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import get from 'lodash/get';
import { OBISchema, DefinitionSummary } from '@bfc/shared';

import { JSONSchema7 } from '../types';

import { useShellApi } from './useShellApi';

type SchemaDefinitionSet = { [$kind: string]: JSONSchema7 };

const mergeSchema = (builtinSdkSchema: OBISchema, customSchemas?: OBISchema[]): OBISchema => {
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

export const useSchemaApi = () => {
  const { schemas } = useShellApi();
  const { sdk, customSchemas } = schemas;
  const builtinSdkSchema: OBISchema = sdk.content;

  const mergedSchema = useMemo(() => mergeSchema(builtinSdkSchema, customSchemas), [builtinSdkSchema, customSchemas]);

  return {
    getSchema: () => mergedSchema,
    getSDKSchema: () => builtinSdkSchema,
    getCustomSchemas: () => customSchemas,
  };
};
