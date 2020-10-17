// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, ITrigger } from '@bfc/shared';
import { ExpressionParser } from 'adaptive-expressions';
import uniq from 'lodash/uniq';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPropertyReferences = (content: any) => {
  const foundProperties: string[] = [];

  if (content) {
    // has $designer: { "propertyGroups": ["<name1>", "<name2", ... ]
    if (content.$designer?.propertyGroups && Array.isArray(content.$designer?.propertyGroups === 'array')) {
      foundProperties.push(...content.$designer.propertyGroups);
    }

    // has "property": "<name>"
    if (content.property && typeof content.property === 'string') {
      foundProperties.push(content.property);
    }

    // has condition : "<expresssion referencing properties>"
    if (content.condition) {
      const expressionParser = new ExpressionParser();
      const expression = expressionParser.parse(content.condition);
      const references = expression.references().map((r) => (r.startsWith('$') ? r.substring(1) : r));
      foundProperties.push(...references);
    }
  }

  return uniq(foundProperties);
};

const getTriggerPropertyReferences = (trigger: ITrigger) => {
  const content = trigger.content;

  // inspect trigger
  const foundProperties: string[] = getPropertyReferences(trigger.content);

  // inspect actions
  if (content.actions && Array.isArray(content.actions)) {
    for (let i = 0; i < content.actions.length; i++) {
      foundProperties.push(...getPropertyReferences(content.actions[i]));
    }
  }

  return uniq(foundProperties);
};

export const groupTriggersByPropertyReference = (
  dialog: DialogInfo,
  options?: { allowMultiParent?: boolean; validProperties?: string[] }
): Record<string, ITrigger[]> => {
  const result = {} as Record<string, ITrigger[]>;

  const validProperties = options?.validProperties;
  const isValidProperty = validProperties
    ? (x: string | undefined) => x && validProperties.findIndex((p) => x === p) !== -1
    : () => true;

  const addResult = (property: string, trigger: ITrigger) => {
    result[property] ? result[property].push(trigger) : (result[property] = [trigger]);
  };

  if (dialog?.triggers) {
    dialog.triggers.forEach((t) => {
      const properties = getTriggerPropertyReferences(t).filter(isValidProperty);
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
