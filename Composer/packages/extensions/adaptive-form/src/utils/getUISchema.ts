// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema, UIOptions } from '@bfc/extension';
import { JSONSchema4 } from 'json-schema';
/**
 * Merges overrides into default ui schema and returns the UIOptions
 */
export function getUISchema(schema?: JSONSchema4, uiSchema?: UISchema): UIOptions {
  const kind = schema?.properties?.$kind?.const;
  return uiSchema && kind && uiSchema[kind] ? uiSchema[kind] : {};
}
