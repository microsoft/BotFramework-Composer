// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateUniqueId } from '@bfc/shared';
import { ChangeHandler } from '@bfc/extension-client';
import { useEffect, useRef, useState } from 'react';

type ArrayChangeHandler<ItemType> = (items: ArrayItem<ItemType>[]) => void;

export interface ArrayItem<ItemType = unknown> {
  id: string;
  value: ItemType;
}

interface ArrayItemState<ItemType> {
  arrayItems: ArrayItem<ItemType>[];
  handleChange: ArrayChangeHandler<ItemType>;
  addItem: (newItem: ItemType) => void;
  handleResetCache: (newItem: ItemType[]) => void;
}

const generateArrayItems = <ItemType = unknown>(value: ItemType[] = []): ArrayItem<ItemType>[] => {
  return value.map((i) => ({
    id: generateUniqueId(),
    value: i,
  }));
};

const createArrayItem = <ItemType = unknown>(value: ItemType): ArrayItem<ItemType> => {
  return {
    id: generateUniqueId(),
    value,
  };
};

export const isItemValueEmpty = (value?: any) =>
  !value || (typeof value === 'object' && !Object.values(value).some((val) => !!val));

export const getArrayItemProps = <ItemType = unknown>(
  items: ArrayItem<ItemType>[],
  index: number,
  onChange: ArrayChangeHandler<ItemType>,
) => {
  const onItemChange = (newValue: ItemType) => {
    const updated = items.map((item, i) => {
      if (index === i) {
        return { ...item, value: newValue };
      }

      return item;
    });
    onChange(updated);
  };

  const onReorder = (aIdx: number) => {
    const copy = [...items];
    const tmp = copy[index];
    copy[index] = copy[aIdx];
    copy[aIdx] = tmp;
    onChange(copy);
  };

  const onRemove = () => {
    const newData = items.slice(0, index).concat(items.slice(index + 1));
    onChange(newData);
  };

  return {
    canRemove: true,
    canMoveDown: index < items.length - 1,
    canMoveUp: index > 0,
    index,
    onChange: onItemChange,
    onReorder,
    onRemove,
  };
};

export function useArrayItems<ItemType = unknown>(
  items: ItemType[] | undefined,
  onChange: ChangeHandler<ItemType[]>,
): ArrayItemState<ItemType> {
  const [cache, setCache] = useState(generateArrayItems(items));

  const didMount = useRef(false);
  useEffect(() => {
    // If the user switches between types and the value
    // gets reset to undefined, then reset the cache
    if (didMount.current && items === undefined) {
      setCache([]);
    }
    didMount.current = true;
  }, [items]);

  const handleChange = (newItems: ArrayItem<ItemType>[]) => {
    setCache(newItems);
    onChange(newItems.map(({ value }) => value).filter(Boolean));
  };

  const addItem = (newItem: ItemType) => {
    // Allow only the last value in the cache to be empty
    const newCache = isItemValueEmpty(newItem) ? cache.filter(({ value }) => !isItemValueEmpty(value)) : cache;
    handleChange(newCache.concat(createArrayItem(newItem)));
  };

  const handleResetCache = (items: ItemType[]) => {
    setCache(generateArrayItems(items));
  };

  return { arrayItems: cache, handleChange, addItem, handleResetCache };
}
