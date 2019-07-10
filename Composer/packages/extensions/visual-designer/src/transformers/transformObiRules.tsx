import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';
import { normalizeObiStep } from './helpers/elementBuilder';

export function transformObiRules(input, parentPath = ''): any {
  if (!input) return {};
  const result: any = {};

  const prefix = parentPath ? parentPath + '.' : '';
  const steps = input.steps || [];
  result.stepGroup = new IndexedNode(`${prefix}steps`, {
    $type: ObiTypes.StepGroup,
    children: steps.map(x => normalizeObiStep(x)),
  });
  return result;
}
