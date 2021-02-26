// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveFieldNames } from '../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';

import { inheritParentProperties } from './inheritParentProperty';

const ConditionKey = AdaptiveFieldNames.Condition;
const CasesKey = AdaptiveFieldNames.Cases;
const CaseStepKey = AdaptiveFieldNames.Actions;
const DefaultBranchKey = AdaptiveFieldNames.DefaultCase;

export function transformSwitchCondition(
  input,
  jsonpath: string
): { condition: IndexedNode; choice: IndexedNode; branches: IndexedNode[] } | null {
  if (!input || typeof input !== 'object') return null;

  const condition = input[ConditionKey] || '';
  const defaultSteps = input[DefaultBranchKey] || [];
  const cases = input[CasesKey] || [];

  const result = {
    condition: new IndexedNode(`${jsonpath}`, {
      ...input,
      $kind: AdaptiveKinds.ConditionNode,
    }),
    choice: new IndexedNode(`${jsonpath}`, {
      $kind: AdaptiveKinds.ChoiceDiamond,
      text: condition,
    }),
    branches: [] as IndexedNode[],
  };

  result.branches.push(
    new IndexedNode(`${jsonpath}.${DefaultBranchKey}`, {
      $kind: AdaptiveKinds.StepGroup,
      label: DefaultBranchKey,
      children: defaultSteps,
    })
  );

  if (!cases || !Array.isArray(cases)) return result;

  result.branches.push(
    ...cases.map(({ value, actions }, index) => {
      const prefix = `${jsonpath}.${CasesKey}[${index}]`;
      return new IndexedNode(`${prefix}.${CaseStepKey}`, {
        $kind: AdaptiveKinds.StepGroup,
        label: value,
        children: actions || [],
      });
    })
  );

  inheritParentProperties(input, [result.condition, result.choice, ...result.branches]);
  return result;
}
