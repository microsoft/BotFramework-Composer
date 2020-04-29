// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import has from 'lodash/has';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import { JsonInsert, JsonSet, IComparator, IJSONChangeUpdate } from '../../src/dialogUtils/jsonDiff';
import { ListDiff, deconstructChangesInListUpdateChanges } from '../../src/dialogUtils/listDiff';

describe('list diff basic function', () => {
  it('should deconstruct changes', () => {
    const changes1: IJSONChangeUpdate[] = [
      {
        path: '[0].name',
        preValue: 'a',
        value: 'x',
      },
    ];

    const dechanges1 = deconstructChangesInListUpdateChanges(changes1);
    expect(dechanges1.updates.length).toEqual(1);
    expect(dechanges1.updates).toEqual(changes1);
    expect(dechanges1.adds.length).toEqual(0);
    expect(dechanges1.deletes.length).toEqual(0);

    const changes2: IJSONChangeUpdate[] = [
      {
        path: '[0]',
        preValue: {
          id: 1,
          name: 'a',
        },
        value: {
          id: 1,
          name: 'x', // name change from 'a' -> 'x'
        },
      },
      {
        path: '[1]',
        preValue: {
          id: 2,
          name: 'b',
        },
        value: {
          id: 2,
          name: 'x', // name change from 'b' -> 'x'
        },
      },
    ];

    const dechanges2 = deconstructChangesInListUpdateChanges(changes2);
    expect(dechanges2.adds.length).toEqual(0);
    expect(dechanges2.deletes.length).toEqual(0);
    expect(dechanges2.updates.length).toEqual(2);
    expect(dechanges2.updates[0].path).toEqual('[0].name');
    expect(dechanges2.updates[0].preValue).toEqual('a');
    expect(dechanges2.updates[0].value).toEqual('x');
    expect(dechanges2.updates[1].path).toEqual('[1].name');
    expect(dechanges2.updates[1].preValue).toEqual('b');
    expect(dechanges2.updates[1].value).toEqual('x');

    const changes3: IJSONChangeUpdate[] = [
      {
        path: '[0]',
        preValue: {
          id: 1,
          name: 'a', // deleted
        },
        value: {
          id: 1,
        },
      },
    ];

    const dechanges3 = deconstructChangesInListUpdateChanges(changes3);
    expect(dechanges3.updates.length).toEqual(0);
    expect(dechanges3.adds.length).toEqual(0);
    expect(dechanges3.deletes.length).toEqual(1);
    expect(dechanges3.deletes[0].path).toEqual('[0].name');

    const changes4: IJSONChangeUpdate[] = [
      {
        path: '[0]',
        preValue: {
          id: 1,
          name: 'a', // updated
        },
        value: {
          id: 1,
          name: 'x',
          desc: 'ha', // add
        },
      },
    ];

    const dechanges4 = deconstructChangesInListUpdateChanges(changes4);
    expect(dechanges4.updates.length).toEqual(1);
    expect(dechanges4.adds.length).toEqual(1);
    expect(dechanges4.deletes.length).toEqual(0);
    expect(dechanges4.updates[0].path).toEqual('[0].name');
    expect(dechanges4.updates[0].preValue).toEqual('a');
    expect(dechanges4.updates[0].value).toEqual('x');
    expect(dechanges4.adds[0].path).toEqual('[0].desc');
    expect(dechanges4.adds[0].value).toEqual('ha');

    const changes5: IJSONChangeUpdate[] = [
      {
        path: '[0]',
        preValue: {
          id: 1,
          name: 'a',
        },
        value: 'x',
      },
    ];

    const dechanges5 = deconstructChangesInListUpdateChanges(changes5);
    expect(dechanges5.updates.length).toEqual(1);
    expect(dechanges5.adds.length).toEqual(0);
    expect(dechanges5.deletes.length).toEqual(0);
    expect(dechanges5.updates).toEqual(changes5);
  });
});

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
    expect(changes2.updates[0].path).toEqual('[1].name');
    expect(changes2.updates[0].preValue).toEqual(base[1].name);
    expect(changes2.updates[0].value).toEqual(list2[1].name);

    const list21 = JsonSet(base, [
      {
        path: '[0]',
        value: { id: 1, name: 'x1' }, // name change from 'a' -> 'x1'
      },
      {
        path: '[1].name',
        value: 'x2', // name change from 'b' -> 'x2'
      },
    ]);
    const changes21 = ListDiff(base, list21);
    expect(changes21.adds.length).toEqual(0);
    expect(changes21.deletes.length).toEqual(0);
    expect(changes21.updates.length).toEqual(2);
    expect(changes21.updates[0].path).toEqual('[0].name');
    expect(changes21.updates[0].preValue).toEqual(base[0].name);
    expect(changes21.updates[0].value).toEqual(list21[0].name);
    expect(changes21.updates[1].path).toEqual('[1].name');
    expect(changes21.updates[1].preValue).toEqual(base[1].name);
    expect(changes21.updates[1].value).toEqual(list21[1].name);

    // multiple changes, add + update
    let list3 = JsonSet(base, [
      {
        path: '[1]',
        value: { id: 2, name: 'x1' }, // name change from 'a' -> 'x1'
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
    expect(changes3.updates[0].path).toEqual('[1].name');
    expect(changes3.updates[0].preValue).toEqual(base[1].name);
    expect(changes3.updates[0].value).toEqual(list3[1].name);
    expect(changes3.adds[0].path).toEqual('[3]');
    expect(changes3.adds[0].value).toEqual(list3[3]);
  });

  it('get changes in object list with a comparator', () => {
    // A customize comparator, if two object has same id, they are same.
    const myComparator: IComparator = (item1: any, item2: any) => {
      let isChange;
      if (has(item1, 'id') && has(item2, 'id')) {
        isChange = !isEqual(get(item1, 'id'), get(item2, 'id'));
      } else {
        isChange = isEqual(item1, item2);
      }
      const isStop = isChange;

      return { isStop, isChange };
    };

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
    const changes1 = ListDiff(base, list1, myComparator);
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
    const changes11 = ListDiff(base, list11, myComparator);
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
    const changes12 = ListDiff(base, list12, myComparator);
    expect(changes12.adds.length).toEqual(1);
    expect(changes12.deletes.length).toEqual(0);
    expect(changes12.updates.length).toEqual(0);
    expect(changes12.adds[0].path).toEqual('[3]');

    // update list item
    const list2 = JsonSet(base, [
      {
        path: '[1]',
        value: { id: 2, name: 'x' }, // update name
      },
    ]);
    const changes2 = ListDiff(base, list2, myComparator);
    expect(changes2.adds.length).toEqual(0);
    expect(changes2.deletes.length).toEqual(0);
    expect(changes2.updates.length).toEqual(0);

    const list21 = JsonSet(base, [
      {
        path: '[0]',
        value: { id: 11, name: 'x1' }, // update id
      },
      {
        path: '[1]',
        value: { id: 2, name: 'x2' }, // only update name
      },
    ]);
    const changes21 = ListDiff(base, list21, myComparator);
    expect(changes21.adds.length).toEqual(0);
    expect(changes21.deletes.length).toEqual(0);
    expect(changes21.updates.length).toEqual(1);
    expect(changes21.updates[0].path).toEqual('[0]');
    expect(changes21.updates[0].preValue).toEqual(base[0]);
    expect(changes21.updates[0].value).toEqual(list21[0]);

    // multiple changes, add + update
    let list3 = JsonSet(base, [
      {
        path: '[0]',
        value: { id: 1, name: 'x' }, // name 'a'->'x'
      },
      {
        path: '[1]',
        value: { id: 22, name: 'x' }, // name 'b'->'x', id 2->22
      },
    ]);
    list3 = JsonInsert(list3, [
      {
        path: '[3]',
        value: { id: 4, name: 'x3' },
      },
    ]);
    const changes3 = ListDiff(base, list3, myComparator);
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
