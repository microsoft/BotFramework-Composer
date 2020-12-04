// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, ITrigger } from '@bfc/shared';
import { ExpressionParser } from 'adaptive-expressions';
import uniq from 'lodash/uniq';

export const NoGroupingTriggerGroupName = '(none)';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPropertyReferences = (content: any) => {
  const foundProperties: string[] = [];

  if (content) {
    // has $designer: { "propertyGroups": ["<name1>", "<name2", ... ]
    if (content.$designer?.propertyGroups && Array.isArray(content.$designer?.propertyGroups)) {
      foundProperties.push(...content.$designer.propertyGroups);
    }

    // has "property": "<name>"
    if (content.property && typeof content.property === 'string') {
      foundProperties.push(content.property);
    }

    // had "expectedProperties" : ["<name1>", "<name2", ... ]
    if (content.expectedProperties && Array.isArray(content.expectedProperties)) {
      foundProperties.push(...content.expectedProperties);
    }

    // has condition : "<expresssion referencing properties>"
    if (content.condition) {
      try {
        const expressionParser = new ExpressionParser();
        const expression = expressionParser.parse(content.condition);
        const references = expression.references().map((r) => (r.startsWith('$') ? r.substring(1) : r));
        foundProperties.push(...references);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Could not parse condition expression ${content.condition}. ${err}`);
      }
    }
  }

  return uniq(foundProperties);
};

const getTriggerPropertyReferences = (trigger: ITrigger, isValidProperty: (name: string) => boolean) => {
  const content = trigger.content;

  // inspect trigger
  const foundProperties: string[] = getPropertyReferences(trigger.content);

  // inspect actions
  if (content.actions && Array.isArray(content.actions)) {
    for (let i = 0; i < content.actions.length; i++) {
      foundProperties.push(...getPropertyReferences(content.actions[i]));
    }
  }

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
 * - "expectedProperties" : ["<name1>", "<name2", ... ]
 * - condition : "<expresssion referencing properties>"
 * - Any of the trigger's action that reference a property.
 * If a trigger does not reference a property, it will be grouped under "(none)"
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
      } else if (properties.length === 1) {
        addResult(properties[0], t);
      }
    });
  }

  return result;
};
