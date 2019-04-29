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

  if (cases) {
    const orderedCases = Object.keys(cases).sort();
    const caseNodes = orderedCases.map(caseName => {
      const prefix = `${jsonpath}.cases.${caseName}`;
      return new IndexedNode(`${prefix}.stepGroup`, {
        $type: ObiTypes.StepGroup,
        children: cases[caseName].map((x, index) => new IndexedNode(`${prefix}[${index}]`, x)),
      });
    });
    result.cases = caseNodes;
  }
  return result;
}
