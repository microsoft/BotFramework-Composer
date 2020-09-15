// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveFieldNames } from '../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../utils/adaptive/stepBuilder';

export function transformObiRules(input, parentPath = ''): { stepGroup: IndexedNode } | null {
  if (!input) return null;

  const prefix = parentPath ? parentPath + '.' : '';
  const steps = input[AdaptiveFieldNames.Actions] || [];
  const stepGroup = new IndexedNode(`${prefix}${AdaptiveFieldNames.Actions}`, {
    $kind: AdaptiveKinds.StepGroup,
    children: steps.map((x) => normalizeObiStep(x)),
  });
  return {
    stepGroup,
  };
}
