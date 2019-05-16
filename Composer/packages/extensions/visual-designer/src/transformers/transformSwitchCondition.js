import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';

export function transformSwitchCondition(input, jsonpath) {
  if (!input || input.$type !== ObiTypes.SwitchCondition) return {};

  const { condition, cases } = input;
  const result = {
    condition: new IndexedNode(`${jsonpath}`, {
      $type: 'Switch',
      text: condition,
    }),
    cases: [],
  };

  if (!cases || !Array.isArray(cases)) return result;

  result.cases = cases.map(({ value, steps }, index) => {
    const prefix = `${jsonpath}.cases[${index}]`;
    return new IndexedNode(`${prefix}.stepGroup`, {
      $type: ObiTypes.StepGroup,
      label: value,
      children: (steps || []).map((x, index) => new IndexedNode(`${prefix}.steps[${index}]`, x)),
    });
  });
  return result;
}
