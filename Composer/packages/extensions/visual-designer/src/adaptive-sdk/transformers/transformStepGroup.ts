// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../utils/stepBuilder';

export function transformStepGroup(input, groupId): IndexedNode[] {
  if (!input || input.$kind !== ObiTypes.StepGroup) return [];
  if (!input.children || !Array.isArray(input.children)) return [];

  return input.children.map((step, index) => new IndexedNode(`${groupId}[${index}]`, normalizeObiStep(step)));
}
