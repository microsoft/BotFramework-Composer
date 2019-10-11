export const NestedFieldNames = {
  Actions: 'actions',
  ElseActions: 'elseActions',
  DefaultCase: 'default',
  Cases: 'cases',
};

const DEFAULT_CHILDREN_KEYS = [NestedFieldNames.Actions];
const childrenMap = {
  ['Microsoft.IfCondition']: [NestedFieldNames.Actions, NestedFieldNames.ElseActions],
  ['Microsoft.SwitchCondition']: [NestedFieldNames.Cases, NestedFieldNames.DefaultCase],
};

/**
 * Considering that an Adaptive Action could be nested with other actions,
 * for example, the IfCondition and SwitchCondition and Foreach, we need
 * this helper to visit all possible action nodes recursively.
 *
 * @param {any} input The input Adaptive Action which has $type field.
 * @param {function} visitor The callback function called on each action node.
 */
export function visitAdaptiveAction(input: any, visitor: (data: any) => any) {
  if (!input || !input.$type) return;

  visitor(input);

  let childrenKeys = DEFAULT_CHILDREN_KEYS;
  if (input.$type && childrenMap[input.$type]) {
    childrenKeys = childrenMap[input.$type];
  }

  for (const childrenKey of childrenKeys) {
    const children = input[childrenKey];
    if (Array.isArray(children)) {
      children.forEach(x => visitAdaptiveAction(x, visitor));
    }
  }
}
