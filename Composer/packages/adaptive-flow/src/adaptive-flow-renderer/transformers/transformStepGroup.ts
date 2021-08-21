// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../utils/adaptive/stepBuilder';

import { inheritParentProperties } from './inheritParentProperty';

export function transformStepGroup(input, groupId): IndexedNode[] {
  if (!input || input.$kind !== AdaptiveKinds.StepGroup) return [];
  if (!input.children || !Array.isArray(input.children)) return [];

  const results: any[] = [];

  if (input.header) {
    results.push(
      new IndexedNode(`${groupId}-header`, {
        $kind: AdaptiveKinds.QuestionCondition,
        ...input.header,
      })
    );
  }

  results.push(...input.children.map((step, index) => new IndexedNode(`${groupId}[${index}]`, normalizeObiStep(step))));
  inheritParentProperties(input, results);
  return results;
}
