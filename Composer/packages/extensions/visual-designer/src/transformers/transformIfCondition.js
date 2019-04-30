import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';

const IfBranchKey = 'steps';
const ElseBranchKey = 'elseSteps';

export function transformIfCondtion(input, jsonpath) {
  if (!input || input.$type !== ObiTypes.IfCondition) return {};

  const result = {
    choice: new IndexedNode(`${jsonpath}`, {
      $type: 'Choice',
      text: input.condition,
    }),
  };

  const ifTrue = input[IfBranchKey];
  const ifFalse = input[ElseBranchKey];
  if (Array.isArray(ifTrue) && ifTrue.length) {
    result.ifGroup = new IndexedNode(`${jsonpath}.${IfBranchKey}`, {
      $type: ObiTypes.StepGroup,
      children: ifTrue.map((x, index) => new IndexedNode(`${jsonpath}.${IfBranchKey}[${index}]`, x)),
    });
  }
  if (Array.isArray(ifFalse) && ifFalse.length) {
    result.elseGroup = new IndexedNode(`${jsonpath}.${ElseBranchKey}`, {
      $type: ObiTypes.StepGroup,
      children: ifFalse.map((x, index) => new IndexedNode(`${jsonpath}.${ElseBranchKey}[${index}]`, x)),
    });
  }

  return result;
}
