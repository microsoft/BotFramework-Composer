// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  MicrosoftAdaptiveDialog,
  BaseSchema,
  SchemaDefinitions,
  SDKKinds,
  SwitchCondition,
} from '@botframework-composer/types';

import { discoverNestedProperties } from './schemaUtils';

// returns true to continue the visit.
type VisitAdaptiveComponentFn = ($kind: SDKKinds | string, data: BaseSchema, path: string) => boolean;

export const walkAdaptiveDialog = (
  adaptiveDialog: MicrosoftAdaptiveDialog,
  sdkSchema: SchemaDefinitions,
  fn: VisitAdaptiveComponentFn
): boolean => {
  return walkWithPath(adaptiveDialog, sdkSchema, '', '', fn);
};

const joinPath = (parentPath: string, currentKey: string | number): string => {
  if (typeof currentKey === 'string') {
    return parentPath ? `${parentPath}.${currentKey}` : currentKey;
  }

  if (typeof currentKey === 'number') {
    return parentPath ? `${parentPath}[${currentKey}]` : `[${currentKey}]`;
  }

  return '';
};

const walkWithPath = (
  adaptiveData: BaseSchema,
  sdkSchema: SchemaDefinitions,
  parentPath: string,
  currentKey: string | number,
  fn: VisitAdaptiveComponentFn
): boolean => {
  const { $kind } = adaptiveData;

  // SwitchCondition needs to be handled specially due to 'CaseCondition' doesn't conains a $kind property but is iterable.
  // Reference: https://github.com/microsoft/botbuilder-dotnet/blob/main/libraries/Microsoft.Bot.Builder.Dialogs.Adaptive/Actions/Case.cs
  if ($kind === SDKKinds.SwitchCondition) {
    return walkSwitchCondition(adaptiveData, sdkSchema, parentPath, currentKey, fn);
  }

  // Visit current data before schema validation to make sure all $kind blocks are visited.
  const currentPath = joinPath(parentPath, currentKey);
  fn($kind, adaptiveData, currentPath);

  const schema = sdkSchema[$kind];
  const nestedProperties = schema ? discoverNestedProperties(schema) : adaptiveData.actions ? ['actions'] : [];
  if (nestedProperties.length === 0) return true;

  /**
   * Examples of nested properties in built-in $kinds:
   *  1. ['actions'] in every Trigger $kind
   *  2. ['actions'] in Foreach, ForeachPage
   *  3. ['actions', 'elseActions'] in IfCondition
   *  4. ['cases', 'default'] in SwitchCondition
   */
  for (const propName of nestedProperties) {
    const childElements = adaptiveData[propName];
    if (!Array.isArray(childElements)) {
      continue;
    }

    /**
     * Visit nested adaptive elements. For example:
     *  1. Triggers under Dialog;
     *  2. Actions under Trigger;
     *  3. Actions under Action.
     */
    for (let i = 0; i < childElements.length; i++) {
      const arrayPath = joinPath(currentPath, propName);
      const shouldContinue = walkWithPath(childElements[i], sdkSchema, arrayPath, i, fn);
      if (!shouldContinue) return false;
    }
  }

  return true;
};

const walkSwitchCondition = (
  switchConditionData: SwitchCondition,
  sdkSchema: SchemaDefinitions,
  parrentPath: string,
  currentKey: string | number,
  fn: VisitAdaptiveComponentFn
): boolean => {
  const currentPath = joinPath(parrentPath, currentKey);
  fn(SDKKinds.SwitchCondition, switchConditionData, currentPath);

  const defaultActions = switchConditionData.default;

  // Visit the 'default' properties
  if (Array.isArray(defaultActions)) {
    for (let i = 0; i < defaultActions.length; i++) {
      const shouldContinue = walkWithPath(defaultActions[i], sdkSchema, joinPath(currentPath, 'default'), i, fn);
      if (!shouldContinue) return false;
    }
  }

  const casesData = switchConditionData.cases;
  if (Array.isArray(casesData)) {
    // Expand cases data
    for (let iCase = 0; iCase < casesData.length; iCase++) {
      const caseActions = casesData[iCase].actions;
      if (!Array.isArray(caseActions)) continue;

      // Expand actions under a case.
      for (let i = 0; i < caseActions.length; i++) {
        const shouldContinue = walkWithPath(caseActions[i], sdkSchema, `${currentPath}.cases[${iCase}].actions`, i, fn);
        if (!shouldContinue) return false;
      }
    }
  }
  return true;
};
