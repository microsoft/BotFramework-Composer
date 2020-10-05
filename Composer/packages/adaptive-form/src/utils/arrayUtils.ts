// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateUniqueId } from '@bfc/shared';
import { ChangeHandler } from '@bfc/extension-client';
import { useEffect, useState } from 'react';
import isEqual from 'lodash/isEqual';

type ArrayChangeHandler<ItemType> = (items: ArrayItem<ItemType>[]) => void;

export interface ArrayItem<ItemType = unknown> {
  id: string;
  value: ItemType;
}

interface ArrayItemState<ItemType> {
  arrayItems: ArrayItem<ItemType>[];
  handleChange: ArrayChangeHandler<ItemType>;
  addItem: (newItem: ItemType) => void;
}

const generateArrayItems = <ItemType = unknown>(value: ItemType[]): ArrayItem<ItemType>[] => {
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

export const getArrayItemProps = <ItemType = unknown>(
  items: ArrayItem<ItemType>[],
  index: number,
  onChange: ArrayChangeHandler<ItemType>
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
  items: ItemType[],
  onChange: ChangeHandler<ItemType[]>
): ArrayItemState<ItemType> {
  const [cache, setCache] = useState(generateArrayItems(items));

  useEffect(() => {
    const newCache = generateArrayItems(items);

    if (
      !isEqual(
        cache.map(({ value }) => value),
        newCache.map(({ value }) => value)
      )
    ) {
      setCache(newCache);
    }
  }, [items]);

  const handleChange = (newItems: ArrayItem<ItemType>[]) => {
    setCache(newItems);
    onChange(newItems.map(({ value }) => value));
  };

  const addItem = (newItem: ItemType) => {
    handleChange(cache.concat(createArrayItem(newItem)));
  };

  return { arrayItems: cache, handleChange, addItem };
}
