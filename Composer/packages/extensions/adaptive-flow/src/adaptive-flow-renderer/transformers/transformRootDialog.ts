// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveFieldNames } from '../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../utils/adaptive/stepBuilder';

const { Events, Actions } = AdaptiveFieldNames;

function transformSimpleDialog(input): { ruleGroup: IndexedNode; stepGroup: IndexedNode } | null {
  if (!input) return null;

  const rules = input[Events] || [];
  const steps = input[Actions] || [];

  const ruleGroup = new IndexedNode(Events, {
    $kind: AdaptiveKinds.RuleGroup,
    children: [...rules],
  });

  const stepGroup = new IndexedNode(Actions, {
    $kind: AdaptiveKinds.StepGroup,
    children: steps.map((x) => normalizeObiStep(x)),
  });
  return {
    ruleGroup,
    stepGroup,
  };
}

export function transformRootDialog(input): { ruleGroup: IndexedNode; stepGroup: IndexedNode } | null {
  return transformSimpleDialog(input);
}
