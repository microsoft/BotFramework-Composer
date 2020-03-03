// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema, UIOptions, JSONSchema7 } from '@bfc/extension';
/**
 * Merges overrides into default ui schema and returns the UIOptions
 */
export function getUISchema(schema?: JSONSchema7, uiSchema?: UISchema): UIOptions {
  const { $kind } = schema?.properties || {};

  const kind = $kind && typeof $kind === 'object' && ($kind.const as string);

  return uiSchema && kind && uiSchema[kind] ? uiSchema[kind] : {};
}
