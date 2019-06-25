import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';
import { normalizeObiStep } from './helpers/elementBuilder';

export function transformObiRules(input, parentPath = '') {
  if (!input) return {};
  const result = {};

  const prefix = parentPath ? parentPath + '.' : '';
  const steps = input.steps || [];
  result.stepGroup = new IndexedNode(`${prefix}steps`, {
    $type: ObiTypes.StepGroup,
    children: steps.map((x, index) => new IndexedNode(`${prefix}steps[${index}]`, normalizeObiStep(x))),
  });
  return result;
}
