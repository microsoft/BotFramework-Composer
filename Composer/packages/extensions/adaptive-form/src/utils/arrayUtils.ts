// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ChangeHandler } from '@bfc/extension';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getArrayItemProps = <T = any>(value: T[], index: number, onChange: ChangeHandler<T[]>) => {
  const onItemChange = (newValue: T) => {
    const updated = value.map((item, i) => {
      if (index === i) {
        return newValue;
      }

      return item;
    });
    onChange(updated);
  };

  const onReorder = (aIdx: number) => {
    const copy = [...value];
    const tmp = copy[index];
    copy[index] = copy[aIdx];
    copy[aIdx] = tmp;
    onChange(copy);
  };

  const onRemove = () => {
    const newData = value.slice(0, index).concat(value.slice(index + 1));
    onChange(newData);
  };

  return {
    canRemove: true,
    canMoveDown: index < value.length - 1,
    canMoveUp: index > 0,
    index,
    onChange: onItemChange,
    onReorder,
    onRemove,
  };
};
