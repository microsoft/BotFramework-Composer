// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook, act } from '@bfc/test-utils/lib/hooks';

import { getPropertyItemProps, useObjectItems } from '../objectUtils';

describe('useObjectItems', () => {
  const onChange = jest.fn();
  const items = { a: 1, b: 2, c: 3 };

  it('returns array item wrappers', () => {
    const { result } = renderHook(() => useObjectItems(items, onChange));
    const { objectEntries } = result.current;

    expect(objectEntries).toHaveLength(3);
    expect(objectEntries[0]).toMatchObject({
      id: expect.any(String),
      propertyName: 'a',
      propertyValue: 1,
    });
  });

  it('can add an item', () => {
    const { result } = renderHook(() => useObjectItems(items, onChange));
    const { addProperty } = result.current;

    expect(result.current.objectEntries).toHaveLength(3);

    act(() => {
      addProperty('d', 4);
    });

    expect(result.current.objectEntries).toHaveLength(4);
    expect(result.current.objectEntries[3].propertyValue).toEqual(4);
    expect(onChange).toHaveBeenCalledWith({ a: 1, b: 2, c: 3, d: 4 });
  });

  it('can set new items', () => {
    const { result } = renderHook(() => useObjectItems(items, onChange));
    const { objectEntries, onChange: handleChange } = result.current;

    act(() => {
      handleChange([...objectEntries]);
    });

    expect(result.current.objectEntries).toHaveLength(3);
  });
});

describe('getPropertyItemProps', () => {
  let onChange: jest.Mock;
  const value = [
    { id: '1', propertyName: 'a', propertyValue: 1 },
    { id: '2', propertyName: 'b', propertyValue: 2 },
    { id: '3', propertyName: 'c', propertyValue: 3 },
  ];

  beforeEach(() => {
    onChange = jest.fn();
  });

  describe('onItemChange', () => {
    it('invokes onChange with updated item', () => {
      const { onChange: onValueChange } = getPropertyItemProps(value, 1, onChange);
      onValueChange(4);
      expect(onChange).toHaveBeenCalledWith([
        { id: '1', propertyName: 'a', propertyValue: 1 },
        { id: '2', propertyName: 'b', propertyValue: 4 },
        { id: '3', propertyName: 'c', propertyValue: 3 },
      ]);
      expect(onChange.mock.calls[0][0]).not.toBe(value);
    });
  });

  describe('onRemove', () => {
    it('removes the item', () => {
      const { onDelete } = getPropertyItemProps(value, 1, onChange);
      onDelete();
      expect(onChange).toHaveBeenCalledWith([
        { id: '1', propertyName: 'a', propertyValue: 1 },
        { id: '3', propertyName: 'c', propertyValue: 3 },
      ]);
      expect(onChange.mock.calls[0][0]).not.toBe(value);
    });
  });
});
