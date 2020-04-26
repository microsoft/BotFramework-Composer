// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JsonInsert, JsonSet } from '../../src/dialogUtils/jsonDiff';
import { ListDiff } from '../../src/dialogUtils/listDiff';

describe('list diff', () => {
  it('get changes in number list', () => {
    // update
    const changes1 = ListDiff([1, 2, 3], [1, 2, 4]);
    expect(changes1.updates.length).toEqual(1);
    expect(changes1.updates[0].preValue).toEqual(3);
    expect(changes1.updates[0].value).toEqual(4);
    expect(changes1.adds.length).toEqual(0);
    expect(changes1.deletes.length).toEqual(0);
    // add
    const changes2 = ListDiff([1, 2, 3], [1, 2, 3, 4]);
    expect(changes2.adds.length).toEqual(1);
    expect(changes2.updates.length).toEqual(0);
    expect(changes2.deletes.length).toEqual(0);

    const changes21 = ListDiff([1, 2, 3], [0, 1, 2, 3]);
    expect(changes21.adds.length).toEqual(1);
    expect(changes21.updates.length).toEqual(0);
    expect(changes21.deletes.length).toEqual(0);
    // delete
    const changes3 = ListDiff([1, 2, 3], [1, 2]);
    expect(changes3.deletes.length).toEqual(1);
    expect(changes3.adds.length).toEqual(0);
    expect(changes3.updates.length).toEqual(0);

    const changes31 = ListDiff([1, 2, 3], [2, 3]);
    expect(changes31.deletes.length).toEqual(1);
    expect(changes31.adds.length).toEqual(0);
    expect(changes31.updates.length).toEqual(0);
    // multiple change
    const changes4 = ListDiff([1, 2, 3], [1, 22, 3, 4]);
    expect(changes4.deletes.length).toEqual(0);
    expect(changes4.updates.length).toEqual(1);
    expect(changes4.updates[0].preValue).toEqual(2);
    expect(changes4.updates[0].value).toEqual(22);
    expect(changes4.adds.length).toEqual(1);

    const changes41 = ListDiff([1, 2, 3], [0, 1, 22, 3]);
    // TODO: find shortest change path.
    // Current { adds: [0],[2];  deletes: [1] }. count as 3 step
    // Suppose { adds: [0]; updates: [1] }.      count as 2 step
    expect(changes41.deletes.length).toEqual(1);
    // expect(changes41.updates.length).toEqual(1);
    // expect(changes41.adds.length).toEqual(0);
    const changes42 = ListDiff([1, 2, 3], [22, 3]);
    // TODO: find shortest change path.
    // Current { updates: [0] `1->22`;  deletes: [1] `2` }.
    // Suppose { updates: [1] `2->22`;  deletes: [0] `1` }. `2->22` seems more natrual
    expect(changes42.deletes.length).toEqual(1);
    expect(changes42.updates.length).toEqual(1);
    expect(changes42.adds.length).toEqual(0);
  });

  it('get changes in object list', () => {
    const base = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' },
    ];

    // insert at list start
    const list1 = JsonInsert(base, [
      {
        path: '[0]',
        value: { id: 0, name: 'x' },
      },
    ]);
    const changes1 = ListDiff(base, list1);
    expect(changes1.adds.length).toEqual(1);
    expect(changes1.deletes.length).toEqual(0);
    expect(changes1.updates.length).toEqual(0);
    expect(changes1.adds[0].path).toEqual('[0]');

    // insert at list middle
    const list11 = JsonInsert(base, [
      {
        path: '[1]',
        value: { id: 0, name: 'x' },
      },
    ]);
    const changes11 = ListDiff(base, list11);
    expect(changes11.adds.length).toEqual(1);
    expect(changes11.deletes.length).toEqual(0);
    expect(changes11.updates.length).toEqual(0);
    expect(changes11.adds[0].path).toEqual('[1]');

    // insert at list end
    const list12 = JsonInsert(base, [
      {
        path: '[3]',
        value: { id: 0, name: 'x' },
      },
    ]);
    const changes12 = ListDiff(base, list12);
    expect(changes12.adds.length).toEqual(1);
    expect(changes12.deletes.length).toEqual(0);
    expect(changes12.updates.length).toEqual(0);
    expect(changes12.adds[0].path).toEqual('[3]');

    // update list item
    const list2 = JsonSet(base, [
      {
        path: '[1]',
        value: { id: 2, name: 'x' },
      },
    ]);
    const changes2 = ListDiff(base, list2);
    expect(changes2.adds.length).toEqual(0);
    expect(changes2.deletes.length).toEqual(0);
    expect(changes2.updates.length).toEqual(1);
    expect(changes2.updates[0].path).toEqual('[1]');
    expect(changes2.updates[0].preValue).toEqual(base[1]);
    expect(changes2.updates[0].value).toEqual(list2[1]);

    const list21 = JsonSet(base, [
      {
        path: '[0]',
        value: { id: 1, name: 'x1' },
      },
      {
        path: '[1]',
        value: { id: 2, name: 'x2' },
      },
    ]);
    const changes21 = ListDiff(base, list21);
    expect(changes21.adds.length).toEqual(0);
    expect(changes21.deletes.length).toEqual(0);
    expect(changes21.updates.length).toEqual(2);
    expect(changes21.updates[0].path).toEqual('[0]');
    expect(changes21.updates[0].preValue).toEqual(base[0]);
    expect(changes21.updates[0].value).toEqual(list21[0]);
    expect(changes21.updates[1].path).toEqual('[1]');
    expect(changes21.updates[1].preValue).toEqual(base[1]);
    expect(changes21.updates[1].value).toEqual(list21[1]);

    // multiple changes, add + update
    let list3 = JsonSet(base, [
      {
        path: '[1]',
        value: { id: 1, name: 'x1' },
      },
    ]);
    list3 = JsonInsert(list3, [
      {
        path: '[3]',
        value: { id: 0, name: 'x3' },
      },
    ]);
    const changes3 = ListDiff(base, list3);
    expect(changes3.adds.length).toEqual(1);
    expect(changes3.deletes.length).toEqual(0);
    expect(changes3.updates.length).toEqual(1);
    expect(changes3.updates[0].path).toEqual('[1]');
    expect(changes3.updates[0].preValue).toEqual(base[1]);
    expect(changes3.updates[0].value).toEqual(list3[1]);
    expect(changes3.adds[0].path).toEqual('[3]');
    expect(changes3.adds[0].value).toEqual(list3[3]);
  });
});
