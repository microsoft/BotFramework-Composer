import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';

export function transformIfCondtion(input, jsonpath) {
  if (!input || input.$type !== ObiTypes.IfCondition) return {};

  const result = {
    choice: new IndexedNode(`${jsonpath}`, {
      $type: 'Choice',
      text: input.condition,
    }),
  };

  const { ifTrue, ifFalse } = input;
  if (Array.isArray(ifTrue) && ifTrue.length) {
    result.ifGroup = new IndexedNode(`${jsonpath}.ifTrue`, {
      $type: ObiTypes.StepGroup,
      children: ifTrue.map((x, index) => new IndexedNode(`${jsonpath}.ifTrue[${index}]`, x)),
    });
  }
  if (Array.isArray(ifFalse) && ifFalse.length) {
    result.elseGroup = new IndexedNode(`${jsonpath}.ifFalse`, {
      $type: ObiTypes.StepGroup,
      children: ifFalse.map((x, index) => new IndexedNode(`${jsonpath}.ifFalse[${index}]`, x)),
    });
  }

  return result;
}
