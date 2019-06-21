import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';
import { normalizeObiStep } from './helpers/elementBuilder';

export function transformObiRules(input, prefixPath = '') {
  if (!input) return {};
  const result = {};

  const steps = input.steps || [];
  result.stepGroup = new IndexedNode(`${prefixPath}steps`, {
    $type: ObiTypes.StepGroup,
    children: steps.map((x, index) => new IndexedNode(`${prefixPath}steps[${index}]`, normalizeObiStep(x))),
  });
  return result;
}
