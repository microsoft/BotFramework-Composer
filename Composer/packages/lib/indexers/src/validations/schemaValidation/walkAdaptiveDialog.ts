// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema, SchemaDefinitions, SDKKinds } from '@botframework-composer/types';
import get from 'lodash/get';

import { discoverNestedPaths } from './schemaUtils';

// returns true to continue the visit.
type VisitAdaptiveComponentFn = (
  $kind: SDKKinds | string,
  data: BaseSchema,
  currentPath: string,
  parentPath: string
) => boolean;

export const walkAdaptiveDialog = (
  adaptiveDialog: BaseSchema,
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
  currentPath: string,
  parentPath: string,
  fn: VisitAdaptiveComponentFn
): boolean => {
  const { $kind } = adaptiveData;
  // Visit current data before schema validation to make sure all $kind blocks are visited.
  fn($kind, adaptiveData, currentPath, parentPath);

  const schema = sdkSchema[$kind];
  const nestedPaths = schema ? discoverNestedPaths(adaptiveData, schema) : adaptiveData.actions ? ['actions'] : [];
  if (nestedPaths.length === 0) return true;

  /**
   * Examples of nested properties in built-in $kinds:
   *  1. ['actions'] in every Trigger $kind
   *  2. ['actions'] in Foreach, ForeachPage
   *  3. ['actions', 'elseActions'] in IfCondition
   *  4. ['cases', 'default'] in SwitchCondition
   */
  for (const path of nestedPaths) {
    const childElements = get(adaptiveData, path);
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
      const shouldContinue = walkWithPath(
        childElements[i],
        sdkSchema,
        joinPath(currentPath, `${path}[${i}]`),
        currentPath,
        fn
      );
      if (!shouldContinue) return false;
    }
  }

  return true;
};
