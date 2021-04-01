// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from '@botframework-composer/types';

export const isTrigger = (schema: JSONSchema7): boolean => {
  const roles = typeof schema.$role === 'string' ? [schema.$role] : schema.$role ?? [];

  return roles.some((roleString) => {
    return roleString.indexOf('implements(Microsoft.ITrigger)') > -1;
  });
};

const triggerNesterProperties = ['actions'];
export const discoverNestedProperties = (schema: JSONSchema7): string[] => {
  if (isTrigger(schema)) return triggerNesterProperties;
  if (!schema.properties) return [];

  return Object.entries(schema.properties)
    .filter(([, propertyDef]) => {
      const { type, items } = propertyDef as any;
      /**
       * Discover child elements (triggers, actions). For example:
       * 1. In Microsoft.IfCondition.schema
       * ```json
       *  properties.actions = {
       *     "type": "array",
       *     "items": {
       *         "$kind": "Microsoft.IDialog"
       *     },
       *     "title": "Actions",
       *     "description": "Actions to execute if condition is true."
       *   }
       * ```
       * Returns ["actions"].
       *
       * 2. In Microsoft.AdaptiveDialog.schema
       * ```json
       *   properties.triggers = {
       *     "type": "array",
       *     "description": "List of triggers defined for this dialog.",
       *     "title": "Triggers",
       *     "items": {
       *         "$kind": "Microsoft.ITrigger",
       *         "title": "Event triggers",
       *         "description": "Event triggers for handling events."
       *     }
       *   }
       * ```
       * Returns ["triggers"].
       */
      const hasNestedAdaptiveElements = type === 'array' && (Boolean(items?.$kind) || Boolean(items?.properties));
      return hasNestedAdaptiveElements;
    })
    .map(([propertyName]) => propertyName);
};
