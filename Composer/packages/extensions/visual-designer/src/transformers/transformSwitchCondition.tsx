import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';

const ConditionKey = 'condition';
const CasesKey = 'cases';
const CaseStepKey = 'steps';
const DefaultBranchKey = 'default';

export function transformSwitchCondition(input, jsonpath) {
  if (!input || input.$type !== ObiTypes.SwitchCondition) return {};

  const condition = input[ConditionKey] || '';
  const defaultSteps = input[DefaultBranchKey] || [];
  const cases = input[CasesKey] || [];

  const result: { [key: string]: any } = {
    condition: new IndexedNode(`${jsonpath}`, {
      ...input,
      $type: ObiTypes.ConditionNode,
    }),
    choice: new IndexedNode(`${jsonpath}`, {
      $type: ObiTypes.ChoiceDiamond,
      text: condition,
    }),
    branches: [],
  };

  result.branches.push(
    new IndexedNode(`${jsonpath}.${DefaultBranchKey}`, {
      $type: ObiTypes.StepGroup,
      label: DefaultBranchKey,
      children: defaultSteps,
    })
  );

  if (!cases || !Array.isArray(cases)) return result;

  result.branches.push(
    ...cases.map(({ value, steps }, index) => {
      const prefix = `${jsonpath}.${CasesKey}[${index}]`;
      return new IndexedNode(`${prefix}.${CaseStepKey}`, {
        $type: ObiTypes.StepGroup,
        label: value,
        children: steps || [],
      });
    })
  );
  return result;
}
