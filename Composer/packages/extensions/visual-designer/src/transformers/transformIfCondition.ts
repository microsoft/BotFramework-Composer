// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiFieldNames } from '../constants/ObiFieldNames';
import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';

const IfBranchKey = ObiFieldNames.Actions;
const ElseBranchKey = ObiFieldNames.ElseActions;

export function transformIfCondtion(
  input,
  jsonpath: string
): { condition: IndexedNode; choice: IndexedNode; ifGroup: IndexedNode; elseGroup: IndexedNode } | null {
  if (!input || input.$type !== ObiTypes.IfCondition) return null;

  const result = {
    condition: new IndexedNode(`${jsonpath}`, {
      ...input,
      $type: ObiTypes.ConditionNode,
    }),
    choice: new IndexedNode(`${jsonpath}`, {
      $type: ObiTypes.ChoiceDiamond,
      text: input.condition,
    }),
    ifGroup: new IndexedNode(`${jsonpath}.${IfBranchKey}`, {
      $type: ObiTypes.StepGroup,
      children: input[IfBranchKey] || [],
    }),
    elseGroup: new IndexedNode(`${jsonpath}.${ElseBranchKey}`, {
      $type: ObiTypes.StepGroup,
      children: input[ElseBranchKey] || [],
    }),
  };

  return result;
}
