import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../shared/elementBuilder';

export function transformStepGroup(input, groupId): IndexedNode[] {
  if (!input || input.$type !== ObiTypes.StepGroup) return [];
  if (!input.children || !Array.isArray(input.children)) return [];

  return input.children.map((step, index) => new IndexedNode(`${groupId}[${index}]`, normalizeObiStep(step)));
}
