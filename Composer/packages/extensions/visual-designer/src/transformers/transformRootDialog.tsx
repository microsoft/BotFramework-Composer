import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';
import { normalizeObiStep } from './helpers/elementBuilder';

function transformSimpleDialog(input): any {
  if (!input) return {};

  const rules = input.rules || [];
  const steps = input.steps || [];

  const result: { [key: string]: any } = {};
  result.ruleGroup = new IndexedNode('rules', {
    $type: ObiTypes.RuleGroup,
    children: [...rules],
  });

  result.stepGroup = new IndexedNode('steps', {
    $type: ObiTypes.StepGroup,
    children: steps.map(x => normalizeObiStep(x)),
  });
  return result;
}

export function transformRootDialog(input): any {
  if (!input) return {};
  return transformSimpleDialog(input);
}
