// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import { JsonInsert } from '../../src/dialogUtils/jsonDiff';
import { ListDiff } from '../../src/dialogUtils/listDiff';

// const base = [
//   { id: 1, name: 'a' },
//   { id: 2, name: 'b' },
//   { id: 3, name: 'c' },
// ];

// const inserts = [
//   // insert at list middle
//   {
//     path: '[0]',
//     value: { id: 0, name: 'x' },
//   },
// ];

describe('list diff', () => {
  it('get insertions in number list', () => {
    const changes1 = ListDiff([1, 2, 3], [1, 2, 4]);
    const changes2 = ListDiff([1, 2, 3], [1, 2, 3, 4]);
    const changes3 = ListDiff([1, 2, 3], [1, 2]);
    const changes4 = ListDiff([1, 2, 3], [1, 22, 3, 4]);
    expect(changes1.updates.length).toEqual(1);
    expect(changes2.adds.length).toEqual(1);
    expect(changes3.deletes.length).toEqual(1);
    expect(changes4.updates.length).toEqual(1);
    expect(changes4.adds.length).toEqual(1);
  });

  // it('get insertions in object list', () => {
  //   const list2 = JsonInsert(base, inserts);
  //   const changes = ListDiff(base, list2);
  //   expect(changes.adds.length).toEqual(2);
  //   // expect(changes.adds[0].path).toEqual('$.foo.bar.c[2]');
  //   // expect(changes.adds[0].value).toEqual('z');
  // });
});
