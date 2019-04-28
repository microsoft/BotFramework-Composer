import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';
import { normalizeObiStep } from './helpers/elementBuilder';

export function transformObiRules(input, jsonpath) {
  if (!input) return {};
  const result = {};
  if (Array.isArray(input.rules)) {
    result.ruleGroup = new IndexedNode(`${jsonpath}.ruleGroup`, {
      $type: ObiTypes.RuleGroup,
      children: input.rules.map((x, index) => new IndexedNode(`${jsonpath}.rules[${index}]`, x)),
    });
  }

  if (Array.isArray(input.steps)) {
    result.stepGroup = new IndexedNode(`${jsonpath}.stepGroup`, {
      $type: ObiTypes.StepGroup,
      children: input.steps.map((x, index) => new IndexedNode(`${jsonpath}.steps[${index}]`, normalizeObiStep(x))),
    });
  }
  return result;
}
