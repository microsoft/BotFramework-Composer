// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import isEqual from 'lodash/isEqual';

import {
  JsonDiff,
  JsonDiffUpdates,
  IComparator,
  getWithJsonPath,
  hasWithJsonPath,
  JsonSet,
  JsonInsert,
  defaultJSONUpdateComparator,
  // defaultJSONAddComparator,
  defualtJSONStopComparison,
  JsonDiffAdds,
} from '../../src/dialogUtils/jsonDiff';

describe('json diff check comparators', () => {
  it('defualtJSONStopComparison', () => {
    expect(defualtJSONStopComparison({}, { a: 1 }, '$')).toEqual(false);
    expect(defualtJSONStopComparison({}, [], '$')).toEqual(true);
    expect(defualtJSONStopComparison(1, { a: 1 }, '$')).toEqual(true);
    expect(defualtJSONStopComparison(1, 'a', '$')).toEqual(true);
  });

  it('defaultJSONUpdateComparator', () => {
    const result1 = defaultJSONUpdateComparator({}, { a: 1 }, '$');
    expect(result1.isChange).toEqual(true);
    expect(result1.isStop).toEqual(false);

    const result2 = defaultJSONUpdateComparator({}, { a: 1 }, '$.a');
    expect(result2.isChange).toEqual(false); // '$.a' is an `add` not `update`
    expect(result2.isStop).toEqual(true);

    const result3 = defaultJSONUpdateComparator({ a: 0, b: 2 }, { a: 1, b: [] }, '$.a');
    expect(result3.isChange).toEqual(true); // '$.a' update from 0 to 1
    expect(result3.isStop).toEqual(true);

    const result4 = defaultJSONUpdateComparator({ a: 0, b: 2 }, { a: 1, b: [] }, '$.b');
    expect(result4.isChange).toEqual(true); // '$.a' update from 2 to []
    expect(result4.isStop).toEqual(true);

    const result5 = defaultJSONUpdateComparator({ a: 0, b: 2 }, { a: 1, b: [] }, '$');
    expect(result5.isChange).toEqual(true);
    expect(result5.isStop).toEqual(false);

    const result6 = defaultJSONUpdateComparator([1, 2], { a: 1, b: [] }, '$');
    expect(result6.isChange).toEqual(true); // update on '$'
    expect(result6.isStop).toEqual(true);

    const result7 = defaultJSONUpdateComparator([1, 2], [1, 22, 3], '$.[1]');
    expect(result7.isChange).toEqual(true);
    expect(result7.isStop).toEqual(true);

    const result8 = defaultJSONUpdateComparator([1, 2], [1, 22, 3], '$.[0]');
    expect(result8.isChange).toEqual(false);
    expect(result8.isStop).toEqual(true);
  });
});

describe('json diff with default comparator', () => {
  it('get all changes in sample object', () => {
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

  it('get all changes in complicapte object', () => {
    const lhs2 = {
      foo: {
        bar: {
          a: ['a', 'b'],
          b: 2,
          c: [
            { id: 1, name: 'a' },
            { id: 2, name: 'b' },
            { id: 3, name: 'c' },
          ],
          d: [
            { id: 1, name: 'a' },
            { id: 2, name: 'b' },
            { id: 3, name: 'c' },
          ],
          f: [
            { id: 1, name: 'a' },
            { id: 2, name: 'b' },
            { id: 3, name: 'c' },
          ],
        },
      },
      buzz: 'world',
    };

    const rhs2 = {
      foo: {
        bar: {
          a: ['a', 'b'],
          b: 2,
          c: [
            { id: 0, name: 'a' }, // insert
            { id: 1, name: 'a' },
            { id: 2, name: 'b' },
            { id: 3, name: 'c' },
          ],
          d: [
            { id: 1, name: 'a' },
            // { id: 2, name: 'b' },  // delete
            { id: 3, name: 'c' },
          ],
          f: [
            { id: 1, name: 'a' },
            { id: 2, name: 'bb' }, // update
            { id: 3, name: 'c' },
          ],
        },
      },
      buzz: 'world',
    };
    const changes = JsonDiff(lhs2, rhs2);
    expect(changes.adds.length).toEqual(1);
    expect(changes.adds[0].path).toEqual('$.foo.bar.c[0]');
    expect(changes.adds[0].value).toEqual(rhs2.foo.bar.c[0]);

    expect(changes.deletes.length).toEqual(1);
    expect(changes.deletes[0].path).toEqual('$.foo.bar.d[1]');

    expect(changes.updates.length).toEqual(1);
    expect(changes.updates[0].path).toEqual('$.foo.bar.f[1]');
    expect(changes.updates[0].value).toEqual(rhs2.foo.bar.f[1]);
    expect(changes.updates[0].preValue).toEqual(lhs2.foo.bar.f[1]);
  });
});

describe('json diff with custom comparator', () => {
  const basic = {
    foo: {
      bar: {
        a: ['a', 'b'],
        b: 2,
        c: [
          { id: 1, name: 'a' },
          { id: 2, name: 'b' },
          { id: 3, name: 'c' },
        ],
        d: [
          { id: 1, name: 'a' },
          { id: 2, name: 'b' },
          { id: 3, name: 'c' },
        ],
        f: [
          { id: 1, name: 'a' },
          { id: 2, name: 'b' },
          { id: 3, name: 'c' },
        ],
      },
    },
    buzz: 'world',
  };
  it('get insertion/updates in list', () => {
    // A customize comparator, if two object has same id, they are same.
    const myComparator: IComparator = (json1: any, json2: any, path: string) => {
      if (hasWithJsonPath(json1, `${path}.id`) && hasWithJsonPath(json2, `${path}.id`)) {
        const isChange = !isEqual(getWithJsonPath(json1, `${path}.id`), getWithJsonPath(json2, `${path}.id`));
        const isStop = isChange || defualtJSONStopComparison(json1, json2, path);
        return { isChange, isStop };
      } else {
        return defaultJSONUpdateComparator(json1, json2, path);
      }
    };

    const list1 = JsonInsert(basic, [
      {
        path: 'foo.bar.c[0]',
        value: { id: 11, name: 'x' },
      },
      {
        path: 'foo.bar.d[1]',
        value: { id: 11, name: 'x' },
      },
    ]);
    const changes1 = JsonDiffAdds(basic, list1);
    expect(changes1.length).toEqual(2);

    const list2 = JsonSet(basic, [
      {
        path: 'foo.bar.c[1]',
        value: { id: 22, name: 'xbb' }, // id change, count as a change
      },
      {
        path: 'foo.bar.c[0]',
        value: { id: 1, name: 'x' }, // id not change, not count as a change
      },
    ]);
    const changes2 = JsonDiffUpdates(basic, list2, myComparator);
    expect(changes2.length).toEqual(1);
  });
});
