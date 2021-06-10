// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, ITrigger } from '@bfc/shared';
import uniq from 'lodash/uniq';

export const NoGroupingTriggerGroupName = '(none)';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPropertyReferences = (content: any) => {
  const foundProperties: string[] = [];

  if (content) {
    if (content.$designer?.propertyGroups && Array.isArray(content.$designer?.propertyGroups)) {
      // has $designer: { "propertyGroups": ["<name1>", "<name2", ... ]
      foundProperties.push(...content.$designer.propertyGroups);
    } else if (content.property && typeof content.property === 'string') {
      // has "property": "<name>"
      foundProperties.push(content.property);
    } else if (content.actions && Array.isArray(content.actions)) {
      // extract from action expectedProperties
      for (const action of content.actions) {
        if (action.expectedProperties && Array.isArray(action.expectedProperties)) {
          foundProperties.push(...action.expectedProperties);
        }
      }
    }
  }

  return uniq(foundProperties);
};

const getTriggerPropertyReferences = (trigger: ITrigger, isValidProperty: (name: string) => boolean) => {
  // inspect trigger and actions
  const foundProperties: string[] = getPropertyReferences(trigger.content);
  const result = uniq(foundProperties).filter(isValidProperty);

  if (result.length === 0) {
    return [NoGroupingTriggerGroupName];
  }

  return result;
};

/**
 * Groups triggers by the property name they reference in:
 * - $designer: { "propertyGroups": ["<name1>", "<name2", ... ]
 * - "property": "<name>"
 * - Action.expectedProperties : ["<name1>", "<name2", ... ]
 * If a trigger does not reference a schema property, it will be grouped under "(none)"
 */
export const groupTriggersByPropertyReference = (
  dialog: DialogInfo,
  options?: { allowMultiParent?: boolean; validProperties?: string[] }
): Record<string, ITrigger[]> => {
  const result = {} as Record<string, ITrigger[]>;

  const isValidProperty = (name: string) =>
    !options?.validProperties || name === NoGroupingTriggerGroupName || options?.validProperties.includes(name);

  const addResult = (property: string, trigger: ITrigger) => {
    result[property] ? result[property].push(trigger) : (result[property] = [trigger]);
  };

  if (dialog?.triggers) {
    dialog.triggers.forEach((t) => {
      const properties = getTriggerPropertyReferences(t, isValidProperty);
      if (properties.length > 1 && options?.allowMultiParent) {
        properties.forEach((p) => {
          addResult(p, t);
        });
      } else if (properties.length >= 1) {
        addResult(properties[0], t);
      }
    });
  }

  return result;
};
