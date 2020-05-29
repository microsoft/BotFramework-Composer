// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateUniqueId } from '@bfc/shared';
import { ChangeHandler } from '@bfc/extension';
import { useState } from 'react';

type ArrayChangeHandler = (items: ArrayItem[]) => void;

export interface ArrayItem {
  id: string;
  value: any;
}

interface ArrayItemState {
  arrayItems: ArrayItem[];
  handleChange: ArrayChangeHandler;
  addItem: (newItem: any) => void;
}

const generateArrayItems = (value: any[]): ArrayItem[] => {
  return value.map(i => ({
    id: generateUniqueId(),
    value: i
  }));
};

const createArrayItem = (value: any): ArrayItem => {
  return {
    id: generateUniqueId(),
    value
  };
};

export const getArrayItemProps = (items: ArrayItem[], index: number, onChange: ArrayChangeHandler) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onItemChange = (newValue: any) => {
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
    onRemove
  };
};

export function useArrayItems(items: any[], onChange: ChangeHandler<any[]>): ArrayItemState {
  const [cache, setCache] = useState<ArrayItem[]>(generateArrayItems(items));

  const handleChange = (newItems: ArrayItem[]) => {
    setCache(newItems);
    onChange(newItems.map(({ value }) => value));
  };

  const addItem = (newItem: any) => {
    handleChange(cache.concat(createArrayItem(newItem)));
  };

  return { arrayItems: cache, handleChange, addItem };
}
