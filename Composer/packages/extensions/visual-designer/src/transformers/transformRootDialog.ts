// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiFieldNames } from '../constants/ObiFieldNames';
import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../utils/stepBuilder';

const { Events, Actions } = ObiFieldNames;

function transformSimpleDialog(input): { ruleGroup: IndexedNode; stepGroup: IndexedNode } | null {
  if (!input) return null;

  const rules = input[Events] || [];
  const steps = input[Actions] || [];

  const ruleGroup = new IndexedNode(Events, {
    $kind: ObiTypes.RuleGroup,
    children: [...rules],
  });

  const stepGroup = new IndexedNode(Actions, {
    $kind: ObiTypes.StepGroup,
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
