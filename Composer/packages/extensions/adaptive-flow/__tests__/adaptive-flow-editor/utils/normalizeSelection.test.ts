// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { normalizeSelection, sortActionIds } from '../../../src/adaptive-flow-editor/utils/normalizeSelection';

describe('normalizeSelection', () => {
  it('should filter out child ids', () => {
    const selectedIds1 = ['actions[0]', 'actions[0].actions[0]', 'actions[0].actions[1]'];
    expect(normalizeSelection(selectedIds1)).toEqual(['actions[0]']);

    const selectedIds2 = ['actions[0]', 'actions[0].actions[0]', 'actions[0].actions[1]', 'actions[1]', 'actions[1].a'];
    expect(normalizeSelection(selectedIds2)).toEqual(['actions[0]', 'actions[1]']);
  });

  it('should keep orphan child ids', () => {
    const selectedIds = ['actions[0]', 'actions[0].actions[0]', 'actions[1].actions[0]'];
    expect(normalizeSelection(selectedIds)).toEqual(['actions[0]', 'actions[1].actions[0]']);
  });

  it('should throw invalid ids', () => {
    const selectedIds = ['action[0].a', 'actions[0].diamond', 'actions', 'actions[0].ifelse'];
    expect(normalizeSelection(selectedIds)).toEqual([]);
  });
});

describe('sortActionIds', () => {
  it('can sort input ids at same level', () => {
    const actionIds = ['actions[10]', 'actions[1]', 'actions[3]', 'actions[2]'];
    expect(sortActionIds(actionIds)).toEqual(['actions[1]', 'actions[2]', 'actions[3]', 'actions[10]']);
  });

  it('can sort input ids with children', () => {
    const actionIds = ['actions[3]', 'actions[2]', 'actions[1].actions[0]', 'actions[1].elseActions[0]', 'actions[1]'];
    expect(sortActionIds(actionIds)).toEqual([
      'actions[1]',
      'actions[1].actions[0]',
      'actions[1].elseActions[0]',
      'actions[2]',
      'actions[3]',
    ]);
  });

  it('can sort ids with orphan children', () => {
    const actionIds = ['actions[3]', 'actions[2]', 'actions[1].actions[0]', 'actions[1].elseActions[0]'];
    expect(sortActionIds(actionIds)).toEqual([
      'actions[1].actions[0]',
      'actions[1].elseActions[0]',
      'actions[2]',
      'actions[3]',
    ]);
  });
});
