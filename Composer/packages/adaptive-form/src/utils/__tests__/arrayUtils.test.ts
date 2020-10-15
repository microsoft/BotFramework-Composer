// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook, act } from '@botframework-composer/test-utils/lib/hooks';

import { ArrayItem, getArrayItemProps, useArrayItems } from '../arrayUtils';

describe('useArrayItems', () => {
  const onChange = jest.fn();
  const items = [1, 2, 3];

  it('returns array item wrappers', () => {
    const { result } = renderHook(() => useArrayItems(items, onChange));

    expect(result.current.arrayItems).toHaveLength(3);
    expect(result.current.arrayItems[0]).toMatchObject({
      id: expect.any(String),
      value: 1,
    });
  });

  it('can add an item', () => {
    const { result } = renderHook(() => useArrayItems(items, onChange));

    expect(result.current.arrayItems).toHaveLength(3);

    act(() => {
      result.current.addItem(42);
    });

    expect(result.current.arrayItems).toHaveLength(4);
    expect(result.current.arrayItems[3].value).toEqual(42);
    expect(onChange).toHaveBeenCalledWith([1, 2, 3, 42]);
  });

  it('can set new items', () => {
    const { result } = renderHook(() => useArrayItems(items, onChange));
    const { arrayItems } = result.current;

    act(() => {
      result.current.handleChange([arrayItems[0], arrayItems[2]]);
    });

    expect(result.current.arrayItems).toHaveLength(2);
    expect(onChange).toHaveBeenCalledWith([1, 3]);
  });
});

describe('getArrayItemProps', () => {
  let onChange: jest.Mock;
  const value: ArrayItem[] = [
    { id: '1', value: 1 },
    { id: '2', value: 2 },
    { id: '3', value: 3 },
  ];

  beforeEach(() => {
    onChange = jest.fn();
  });

  describe('canRemove', () => {
    it('always returns true', () => {
      expect(getArrayItemProps(value, 0, onChange).canRemove).toBe(true);
    });
  });

  describe('canMoveDown', () => {
    it('returns true when item is not last', () => {
      expect(getArrayItemProps(value, 0, onChange).canMoveDown).toBe(true);
    });

    it('returns false when item is last', () => {
      expect(getArrayItemProps(value, 2, onChange).canMoveDown).toBe(false);
    });
  });

  describe('canMoveUp', () => {
    it('returns truen when item is not first', () => {
      expect(getArrayItemProps(value, 1, onChange).canMoveUp).toBe(true);
    });

    it('returns false when item is first', () => {
      expect(getArrayItemProps(value, 0, onChange).canMoveUp).toBe(false);
    });
  });

  describe('onItemChange', () => {
    it('invokes onChange with updated item', () => {
      const { onChange: onItemChange } = getArrayItemProps(value, 1, onChange);
      onItemChange(4);
      expect(onChange).toHaveBeenCalledWith([
        { id: '1', value: 1 },
        { id: '2', value: 4 },
        { id: '3', value: 3 },
      ]);
      expect(onChange.mock.calls[0][0]).not.toBe(value);
    });
  });

  describe('onReorder', () => {
    it('swaps two items', () => {
      const { onReorder } = getArrayItemProps(value, 0, onChange);
      onReorder(1);
      expect(onChange).toHaveBeenCalledWith([
        { id: '2', value: 2 },
        { id: '1', value: 1 },
        { id: '3', value: 3 },
      ]);
      expect(onChange.mock.calls[0][0]).not.toBe(value);
    });
  });

  describe('onRemove', () => {
    it('removes the item', () => {
      const { onRemove } = getArrayItemProps(value, 1, onChange);
      onRemove();
      expect(onChange).toHaveBeenCalledWith([
        { id: '1', value: 1 },
        { id: '3', value: 3 },
      ]);
      expect(onChange.mock.calls[0][0]).not.toBe(value);
    });
  });
});
