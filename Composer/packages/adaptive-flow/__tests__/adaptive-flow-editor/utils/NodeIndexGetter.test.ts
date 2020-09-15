// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NodeIndexGenerator } from '../../../src/adaptive-flow-editor/utils/NodeIndexGetter';

describe('NodeIndexGetter', () => {
  it('can work e2e.', () => {
    const n = new NodeIndexGenerator();

    const aId = n.getNodeIndex('a');
    expect(aId).toEqual(0);
    expect(n.getItemList()).toEqual([{ key: 'a' }]);

    const bId = n.getNodeIndex('b');
    expect(bId).toEqual(1);
    expect(n.getItemList()).toEqual([{ key: 'a' }, { key: 'b' }]);

    const bId2 = n.getNodeIndex('b');
    expect(bId2).toEqual(1);
    expect(n.getItemList()).toEqual([{ key: 'a' }, { key: 'b' }]);

    n.reset();
    expect(n.getItemList()).toEqual([]);
  });
});
