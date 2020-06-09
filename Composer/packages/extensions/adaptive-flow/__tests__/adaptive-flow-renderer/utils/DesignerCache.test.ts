// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DesignerCache } from '../../../src/adaptive-flow-renderer/utils/visual/DesignerCache';
import { Boundary } from '../../../src/adaptive-flow-renderer/models/Boundary';

describe('DesignerCache', () => {
  it('could cache action boundary', () => {
    const action = { $designer: { id: '1234' }, $kind: 'Kind1' };
    const actionBund = new Boundary(1, 2);
    const cache = new DesignerCache();

    cache.cacheBoundary(action, actionBund);
    expect(cache.loadBounary(action)).toEqual(new Boundary(1, 2));

    action.$designer.id = '5678';
    expect(cache.loadBounary(action)).toBeFalsy();
  });

  it('could uncache action boundary', () => {
    const action = { $designer: { id: '1234' }, $kind: 'Kind1' };
    const actionBound = new Boundary(100, 200);
    const cache = new DesignerCache();

    cache.cacheBoundary(action, actionBound);
    expect(cache.loadBounary(action)).toEqual(actionBound);

    cache.uncacheBoundary(action);
    expect(cache.loadBounary(action)).toBeFalsy();
  });

  it('could reset when exceeded MAX_SIZE.', () => {
    const cache = new DesignerCache(2);
    const actions = [
      { $designer: { id: '1' }, $kind: 'Kind2' },
      { $designer: { id: '2' }, $kind: 'Kind2' },
      { $designer: { id: '3' }, $kind: 'Kind2' },
    ];
    const bound = new Boundary(100, 200);

    cache.cacheBoundary(actions[0], bound);
    expect(cache.loadBounary(actions[0])).toEqual(bound);
    cache.cacheBoundary(actions[1], bound);
    expect(cache.loadBounary(actions[1])).toEqual(bound);

    // exceed the maxium size 2
    cache.cacheBoundary(actions[2], bound);
    expect(cache.loadBounary(actions[2])).toEqual(bound);
    expect(cache.loadBounary(actions[0])).toBeFalsy();
    expect(cache.loadBounary(actions[1])).toBeFalsy();
  });
});
