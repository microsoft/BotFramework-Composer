// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogFactory } from '@bfc/shared';

import { insert, deleteNode, queryNode, getParentPaths } from '../../src/utils/jsonTracker';

const factory = new DialogFactory({});

describe('queryNode', () => {
  describe('can query correct result', () => {
    const dialog = { foo: { bar: [{ $kind: 'firstOne' }, { $kind: 'secondOne' }] } };
    it('when data not exists.', () => {
      expect(queryNode({}, 'foo.bar[0]')).toEqual(null);
    });

    it('when data locates in an object.', () => {
      expect(queryNode(dialog, 'foo.bar')).toEqual([{ $kind: 'firstOne' }, { $kind: 'secondOne' }]);
    });

    it('when data locates in an array.', () => {
      expect(queryNode(dialog, 'foo.bar[0]')).toEqual({ $kind: 'firstOne' });
    });
  });

  it('should return a reference.', () => {
    const dialog = { foo: { bar: 'bar' } };
    const result = queryNode(dialog, 'foo');
    expect(result).toBe(dialog.foo);

    dialog.foo.bar = 'newValue';
    expect(dialog.foo).toEqual({ bar: 'newValue' });
    expect(result).toEqual({ bar: 'newValue' });
  });
});

describe('insert', () => {
  const path = 'foo.bar';
  let dialog;

  beforeEach(() => {
    dialog = { foo: {} };
  });

  describe('when data already exists', () => {
    beforeEach(() => {
      dialog.foo.bar = [{ $kind: 'firstOne' }, { $kind: 'secondOne' }];
    });

    it('inserts into the correct position', () => {
      const updated = insert(dialog, path, 1, 'newOne', factory);
      expect(updated.foo.bar).toEqual([
        {
          $kind: 'firstOne',
        },
        {
          $kind: 'newOne',
          $designer: { id: expect.any(String) },
        },
        {
          $kind: 'secondOne',
        },
      ]);
    });

    it('inserts into front if position is less than 0', () => {
      const updated = insert(dialog, path, -2, 'newOne', factory);
      expect(updated.foo.bar).toEqual([
        {
          $kind: 'newOne',
          $designer: { id: expect.any(String) },
        },
        {
          $kind: 'firstOne',
        },
        {
          $kind: 'secondOne',
        },
      ]);
    });

    it('inserts into end if position is greater than length', () => {
      const updated = insert(dialog, path, 10, 'newOne', factory);
      expect(updated.foo.bar).toEqual([
        {
          $kind: 'firstOne',
        },
        {
          $kind: 'secondOne',
        },
        {
          $kind: 'newOne',
          $designer: { id: expect.any(String) },
        },
      ]);
    });

    it('inserts at end if position is undefined', () => {
      const updated = insert(dialog, path, undefined, 'newOne', factory);
      expect(updated.foo.bar).toEqual([
        {
          $kind: 'firstOne',
        },
        {
          $kind: 'secondOne',
        },
        {
          $kind: 'newOne',
          $designer: { id: expect.any(String) },
        },
      ]);
    });
  });

  describe('when data does not exist', () => {
    it('inserts a new array with one element', () => {
      const path = 'foo.bar';

      const updated = insert(dialog, path, 0, 'newOne', factory);

      expect(updated.foo.bar).toEqual([{ $kind: 'newOne', $designer: { id: expect.any(String) } }]);
    });
  });
});

describe('delete node flow', () => {
  let dialog, path, removedDataFn;
  beforeEach(() => {
    dialog = { foo: { bar: [{ $kind: 'firstOne' }, { $kind: 'secondOne' }] } };
    removedDataFn = jest.fn();
  });

  describe('when target node does not exist', () => {
    it('should not change the data', () => {
      path = null;
      const result = deleteNode(dialog, path, removedDataFn);

      expect(result).toEqual(dialog);
      expect(removedDataFn).not.toBeCalled();
    });
  });

  describe('when target node exists', () => {
    it("should delete node successfully when targetNode's currentKey type is number", () => {
      path = 'foo.bar[0]';
      const result = deleteNode(dialog, path, removedDataFn);

      expect(result).toEqual({ foo: { bar: [{ $kind: 'secondOne' }] } });
      expect(removedDataFn).toBeCalledWith(dialog.foo.bar[0]);
    });
    it("should delete node successfully when targetNode's currentKey type is string", () => {
      path = 'foo.bar';
      const result = deleteNode(dialog, path, removedDataFn);

      expect(result).toEqual({ foo: {} });
      expect(removedDataFn).toBeCalledWith(dialog.foo.bar);
    });
    it("removeLgTemplate function should be called when targetNode's $kind is 'Microsoft.SendActivity' && activity includes '[bfdactivity_'", () => {
      dialog.foo.activityNode = { $kind: 'Microsoft.SendActivity', activity: '[bfdactivity_a]' };
      path = 'foo.activityNode';
      const result = deleteNode(dialog, path, removedDataFn);

      expect(removedDataFn).toBeCalledWith(dialog.foo.activityNode);
      expect(result).toEqual({ foo: { bar: [{ $kind: 'firstOne' }, { $kind: 'secondOne' }] } });
    });
  });
});

describe('getParentPaths', () => {
  it('can generate correct parent paths.', () => {
    expect(getParentPaths('a')).toEqual([]);
    expect(getParentPaths('a.b')).toEqual(['a']);
    expect(getParentPaths('a.b.c')).toEqual(['a', 'a.b']);
    expect(getParentPaths('a.b.c.d')).toEqual(['a', 'a.b', 'a.b.c']);
    expect(getParentPaths('triggers[0].actions[0].actions')).toEqual(['triggers[0]', 'triggers[0].actions[0]']);
  });
});
