// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema, UIOptions } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

/**
 * Merges overrides into default ui schema and returns the UIOptions
 */
export function getUISchema($type: SDKTypes, uiSchema?: UISchema): UIOptions {
  const typeSchema = uiSchema?.[$type];

  if (!typeSchema) {
    return {};
  }

  return typeSchema;
}
