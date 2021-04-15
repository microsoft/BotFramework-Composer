// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema, JSONSchema7 } from '@botframework-composer/types';
import get from 'lodash/get';

export const isTrigger = (schema: JSONSchema7): boolean => {
  const roles = typeof schema.$role === 'string' ? [schema.$role] : schema.$role ?? [];

  return roles.some((roleString) => {
    return roleString.indexOf('implements(Microsoft.ITrigger)') > -1;
  });
};

const triggerNesterProperties = ['actions'];

const propertyDefinesActionArray = (propertyDefinition: JSONSchema7): boolean => {
  if (!propertyDefinition) {
    return false;
  }
  const { type, items } = propertyDefinition;
  return type === 'array' && Boolean(get(items, '$kind'));
};

export const discoverNestedPaths = (data: BaseSchema, schema: JSONSchema7): string[] => {
  if (isTrigger(schema)) return triggerNesterProperties;
  if (!schema.properties) return [];

  const nestedPaths: string[] = [];

  const entries = Object.entries(schema.properties);
  for (const entry of entries) {
    const [propertyName, propertyDef] = entry;
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
    const propertyData = get(data, propertyName);
    if (!Array.isArray(propertyData) || !propertyData.length) continue;

    const isSchemaNested = propertyDefinesActionArray(propertyDef);
    const dataContainsAction = Boolean(propertyData[0].$kind);

    if (isSchemaNested && dataContainsAction) {
      nestedPaths.push(propertyName);
      continue;
    }

    /**
     * Discover skip-level child elements. Currently, this logic is for handling SwitchCondition.
     * Reference to SwitchCondition.schema: https://github.com/microsoft/botbuilder-dotnet/blob/main/libraries/Microsoft.Bot.Builder.Dialogs.Adaptive/Schemas/Actions/Microsoft.SwitchCondition.schema
     * 
     * Example:
     *  properties.cases.items.properties = {
     *   "value": { ... },
     *   "actions": { // Discover this property
     *       "type": "array",
     *       "items": {
     *           "$kind": "Microsoft.IDialog"
     *       },
     *       "title": "Actions",
     *       "description": "Actions to execute."
     *   }
     * }
     */
    const actionsUnderItems = get(items, 'properties.actions');
    const schemaHasSkipLevelActions = type === 'array' && Boolean(actionsUnderItems) && propertyDefinesActionArray(actionsUnderItems);

    if (schemaHasSkipLevelActions) {
      propertyData.forEach((caseData, caseIndex) => {
        const caseActions = caseData.actions;
        if (!Array.isArray(caseActions) || !caseActions.length) return;

        for (let i = 0; i < caseActions.length; i++) {
          nestedPaths.push(`${propertyName}[${caseIndex}].actions`);
        }
      });
    }
  }

  return nestedPaths;
};
