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

  if (!cases) return result;

  let caseList = [];
  if (Array.isArray(cases)) {
    caseList = cases.map(({ value, steps }, index) => {
      const prefix = `${jsonpath}.cases[${index}]`;
      return new IndexedNode(`${prefix}.stepGroup`, {
        $type: ObiTypes.StepGroup,
        label: value,
        children: steps.map((x, index) => new IndexedNode(`${prefix}[${index}]`, x)),
      });
    });
  } else {
    const orderedCases = Object.keys(cases).sort();
    caseList = orderedCases.map(caseName => {
      const prefix = `${jsonpath}.cases.${caseName}`;
      return new IndexedNode(`${prefix}.stepGroup`, {
        $type: ObiTypes.StepGroup,
        label: caseName,
        children: cases[caseName].map((x, index) => new IndexedNode(`${prefix}[${index}]`, x)),
      });
    });
  }

  result.cases = caseList;
  return result;
}
