import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../utils/stepBuilder';

export function transformObiRules(input, parentPath = ''): { stepGroup: IndexedNode } | null {
  if (!input) return null;

  const prefix = parentPath ? parentPath + '.' : '';
  const steps = input.steps || [];
  const stepGroup = new IndexedNode(`${prefix}steps`, {
    $type: ObiTypes.StepGroup,
    children: steps.map(x => normalizeObiStep(x)),
  });
  return {
    stepGroup,
  };
}
