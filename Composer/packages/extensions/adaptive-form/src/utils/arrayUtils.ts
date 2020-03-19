// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateUniqueId } from '@bfc/shared';

type ArrayChangeHandler = (items: ArrayItem[]) => void;

export interface ArrayItem {
  id: string;
  value: any;
}

export const generateArrayItems = (value: any[]): ArrayItem[] => {
  return value.map(i => ({
    id: generateUniqueId(),
    value: i,
  }));
};

export const createArrayItem = (value: any): ArrayItem => {
  return {
    id: generateUniqueId(),
    value,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getArrayItemProps = (items: ArrayItem[], index: number, onChange: ArrayChangeHandler) => {
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
    onRemove,
  };
};
