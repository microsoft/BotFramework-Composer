import { ObiTypes } from '../shared/ObiTypes';
import { IndexedNode } from '../shared/IndexedNode';
import { normalizeObiStep } from '../shared/elementBuilder';

function transformSimpleDialog(input): { ruleGroup: IndexedNode; stepGroup: IndexedNode } | null {
  if (!input) return null;

  const rules = input.rules || [];
  const steps = input.steps || [];

  const ruleGroup = new IndexedNode('rules', {
    $type: ObiTypes.RuleGroup,
    children: [...rules],
  });

  const stepGroup = new IndexedNode('steps', {
    $type: ObiTypes.StepGroup,
    children: steps.map(x => normalizeObiStep(x)),
  });
  return {
    ruleGroup,
    stepGroup,
  };
}

export function transformRootDialog(input): { ruleGroup: IndexedNode; stepGroup: IndexedNode } | null {
  return transformSimpleDialog(input);
}
