// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JsonDiff } from '../../src/dialogUtils/jsonDiff';

const lhs = {
  foo: {
    bar: {
      a: ['a', 'b'],
      b: 2,
      c: ['x', 'y'],
      e: 100, // deleted
    },
  },
  buzz: 'world',
};

const rhs = {
  foo: {
    bar: {
      a: ['a'], // index 1 ('b')  deleted
      b: 2, // unchanged
      c: ['x', { cc: 2 }, 'z'], // 'z' added, 'y' updated
      d: 'Hello, world!', // added
    },
  },
  buzz: 'fizz', // updated
};

describe('json diff', () => {
  it('get all changes', () => {
    const changes = JsonDiff(lhs, rhs);
    expect(changes.adds.length).toEqual(2);
    expect(changes.adds[0].path).toEqual('$.foo.bar.c[2]');
    expect(changes.adds[0].value).toEqual('z');
    expect(changes.adds[1].path).toEqual('$.foo.bar.d');
    expect(changes.adds[1].value).toEqual('Hello, world!');

    expect(changes.deletes.length).toEqual(2);
    expect(changes.deletes[0].path).toEqual('$.foo.bar.a[1]');
    expect(changes.deletes[0].value).toEqual('b');
    expect(changes.deletes[1].path).toEqual('$.foo.bar.e');
    expect(changes.deletes[1].value).toEqual(100);

    expect(changes.updates.length).toEqual(2);
    expect(changes.updates[0].path).toEqual('$.foo.bar.c[1]');
    expect(changes.updates[0].preValue).toEqual('y');
    expect(changes.updates[0].value).toEqual({ cc: 2 });
    expect(changes.updates[1].path).toEqual('$.buzz');
    expect(changes.updates[1].preValue).toEqual('world');
    expect(changes.updates[1].value).toEqual('fizz');
  });
});

// const lhs2 = {
//   foo: {
//     bar: {
//       a: ['a', 'b'],
//       b: 2,
//       c: [
//         { id: 1, name: 'a' },
//         { id: 2, name: 'b' },
//         { id: 3, name: 'c' },
//       ],
//       d: [
//         { id: 1, name: 'a' },
//         { id: 2, name: 'b' },
//         { id: 3, name: 'c' },
//       ],
//       f: [
//         { id: 1, name: 'a' },
//         { id: 2, name: 'b' },
//         { id: 3, name: 'c' },
//       ],
//     },
//   },
//   buzz: 'world',
// };

// const rhs2 = {
//   foo: {
//     bar: {
//       a: ['a', 'b'],
//       b: 2,
//       c: [
//         { id: 0, name: 'a' }, // insert
//         { id: 1, name: 'a' },
//         { id: 2, name: 'b' },
//         { id: 3, name: 'c' },
//       ],
//       d: [
//         { id: 1, name: 'a' },
//         // { id: 2, name: 'b' },  // delete
//         { id: 3, name: 'c' },
//       ],
//       f: [
//         { id: 1, name: 'a' },
//         { id: 2, name: 'bb' }, // update
//         { id: 3, name: 'c' },
//       ],
//     },
//   },
//   buzz: 'world',
// };
// describe('json diff with array differ', () => {
//   it('get insertion in list', () => {
//     const changes = JsonDiff(lhs2, rhs2);
//     expect(changes.adds.length).toEqual(2);
//     expect(changes.adds[0].path).toEqual('$.foo.bar.c[2]');
//     expect(changes.adds[0].value).toEqual('z');
//     expect(changes.adds[1].path).toEqual('$.foo.bar.d');
//     expect(changes.adds[1].value).toEqual('Hello, world!');

//     expect(changes.deletes.length).toEqual(2);
//     expect(changes.deletes[0].path).toEqual('$.foo.bar.a[1]');
//     expect(changes.deletes[0].value).toEqual('b');
//     expect(changes.deletes[1].path).toEqual('$.foo.bar.e');
//     expect(changes.deletes[1].value).toEqual(100);

//     expect(changes.updates.length).toEqual(2);
//     expect(changes.updates[0].path).toEqual('$.foo.bar.c[1]');
//     expect(changes.updates[0].preValue).toEqual('y');
//   });
// });
