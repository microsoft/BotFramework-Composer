// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FormUISchema, UIOptions, JSONSchema7 } from '@bfc/extension';
/**
 * Merges overrides and plugins into default ui schema and returns the UIOptions
 */
export function getUIOptions(schema?: JSONSchema7, uiSchema?: FormUISchema): UIOptions {
  const { $kind } = schema?.properties || {};

  const kind = $kind && typeof $kind === 'object' && ($kind.const as string);

  const formOptions = uiSchema && kind && uiSchema[kind] ? uiSchema[kind] : {};

  return formOptions;
}
