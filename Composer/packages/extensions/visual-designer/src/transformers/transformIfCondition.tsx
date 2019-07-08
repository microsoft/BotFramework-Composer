import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';

const IfBranchKey = 'steps';
const ElseBranchKey = 'elseSteps';

export function transformIfCondtion(input, jsonpath) {
  if (!input || input.$type !== ObiTypes.IfCondition) return {};

  const result: { [key: string]: IndexedNode } = {
    condition: new IndexedNode(`${jsonpath}`, {
      ...input,
      $type: ObiTypes.ConditionNode,
    }),
    choice: new IndexedNode(`${jsonpath}`, {
      $type: ObiTypes.ChoiceDiamond,
      text: input.condition,
    }),
  };

  const ifTrue = input[IfBranchKey] || [];
  const ifFalse = input[ElseBranchKey] || [];

  result.ifGroup = new IndexedNode(`${jsonpath}.${IfBranchKey}`, {
    $type: ObiTypes.StepGroup,
    children: ifTrue,
  });
  result.elseGroup = new IndexedNode(`${jsonpath}.${ElseBranchKey}`, {
    $type: ObiTypes.StepGroup,
    children: ifFalse,
  });

  return result;
}
