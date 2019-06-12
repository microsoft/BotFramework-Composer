import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';
import { normalizeObiStep } from './helpers/elementBuilder';

export function transformObiRules(input, jsonpath) {
  if (!input) return {};
  const result = {};

  const steps = input.steps || [];
  result.stepGroup = new IndexedNode(`${jsonpath}.steps`, {
    $type: ObiTypes.StepGroup,
    children: steps.map((x, index) => new IndexedNode(`${jsonpath}.steps[${index}]`, normalizeObiStep(x))),
  });
  return result;
}
