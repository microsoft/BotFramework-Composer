// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7Definition } from 'json-schema';

export type SchemaDefinitions = {
  [key: string]: JSONSchema7Definition;
};

export type DefinitionCache = Map<string, JSONSchema7Definition>;
