// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema, UIOptions, JSONSchema7, RoleSchema } from '@bfc/extension';
/**
 * Merges overrides and plugins into default ui schema and returns the UIOptions
 */
export function getUIOptions(schema?: JSONSchema7, uiSchema?: UISchema, roleSchema?: RoleSchema): UIOptions {
  const { $kind } = schema?.properties || {};
  const { $role } = schema || {};

  const kind = $kind && typeof $kind === 'object' && ($kind.const as string);

  const formOptions = uiSchema && kind && uiSchema[kind] ? uiSchema[kind] : {};
  const roleOptions = roleSchema && $role && roleSchema[$role] ? roleSchema[$role] : {};

  return { ...roleOptions, ...formOptions };
}
