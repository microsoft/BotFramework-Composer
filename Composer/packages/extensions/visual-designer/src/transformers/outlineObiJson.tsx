import { ObiTypes } from '../shared/ObiTypes';

const DEFAULT_CHILDREN_KEYS = ['steps'];
const childrenMap = {
  [ObiTypes.AdaptiveDialog]: ['steps'],
  [ObiTypes.IfCondition]: ['steps', 'elseSteps'],
  [ObiTypes.SwitchCondition]: ['cases'],
};

export function outlineObiJson(input: { [key: string]: any }) {
  if (!input) return {};

  const outline: { [key: string]: any } = {};
  let childrenKeys = DEFAULT_CHILDREN_KEYS;
  if (input.$type && childrenMap[input.$type]) {
    childrenKeys = childrenMap[input.$type];
  }

  outline.$type = input.$type;

  for (const childrenKey of childrenKeys) {
    const children = input[childrenKey];
    if (Array.isArray(children)) {
      outline[childrenKey] = children.map(x => outlineObiJson(x));
    }
  }
  return outline;
}
