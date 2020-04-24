// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { deleteNode, queryNode, getParentPaths } from '../../src/dialogUtils/jsonTracker';

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
    it("removeLgTemplate function should be called when targetNode's $kind is 'Microsoft.SendActivity' && activity includes '[SendActivity_'", () => {
      dialog.foo.activityNode = { $kind: 'Microsoft.SendActivity', activity: '[SendActivity_a]' };
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
