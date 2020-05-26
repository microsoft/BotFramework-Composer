// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiFieldNames } from '../constants/ObiFieldNames';
import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';

const ConditionKey = ObiFieldNames.Condition;
const CasesKey = ObiFieldNames.Cases;
const CaseStepKey = ObiFieldNames.Actions;
const DefaultBranchKey = ObiFieldNames.DefaultCase;

export function transformSwitchCondition(
  input,
  jsonpath: string
): { condition: IndexedNode; choice: IndexedNode; branches: IndexedNode[] } | null {
  if (!input || input.$kind !== ObiTypes.SwitchCondition) return null;

  const condition = input[ConditionKey] || '';
  const defaultSteps = input[DefaultBranchKey] || [];
  const cases = input[CasesKey] || [];

  const result = {
    condition: new IndexedNode(`${jsonpath}`, {
      ...input,
      $kind: ObiTypes.ConditionNode,
    }),
    choice: new IndexedNode(`${jsonpath}`, {
      $kind: ObiTypes.ChoiceDiamond,
      text: condition,
    }),
    branches: [] as IndexedNode[],
  };

  result.branches.push(
    new IndexedNode(`${jsonpath}.${DefaultBranchKey}`, {
      $kind: ObiTypes.StepGroup,
      label: DefaultBranchKey,
      children: defaultSteps,
    })
  );

  if (!cases || !Array.isArray(cases)) return result;

  result.branches.push(
    ...cases.map(({ value, actions }, index) => {
      const prefix = `${jsonpath}.${CasesKey}[${index}]`;
      return new IndexedNode(`${prefix}.${CaseStepKey}`, {
        $kind: ObiTypes.StepGroup,
        label: value,
        children: actions || [],
      });
    })
  );
  return result;
}
