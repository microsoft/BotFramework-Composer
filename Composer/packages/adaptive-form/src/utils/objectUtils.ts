// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateUniqueId } from '@bfc/shared';
import { ChangeHandler } from '@bfc/extension-client';
import { useEffect, useState } from 'react';
import isEqual from 'lodash/isEqual';

type ItemType<ValueType = unknown> = { [key: string]: ValueType };
type ObjectChangeHandler<ValueType = unknown> = (items: ObjectItem<ValueType>[]) => void;

export interface ObjectItem<ValueType = unknown> {
  id: string;
  propertyName: string;
  propertyValue?: ValueType;
}

interface ObjectItemState<ValueType = unknown> {
  objectEntries: ObjectItem<ValueType>[];
  onChange: ObjectChangeHandler<ValueType>;
  addProperty: (name?: string, value?: ValueType) => void;
}

const generateObjectEntries = <ValueType = unknown>(value: ItemType<ValueType>): ObjectItem<ValueType>[] => {
  return Object.entries(value || {}).map((entry) => createObjectItem(...entry));
};

const createObjectItem = <ValueType = unknown>(propertyName = '', propertyValue?: ValueType): ObjectItem<ValueType> => {
  return {
    id: generateUniqueId(),
    propertyName,
    propertyValue,
  };
};

export const getPropertyItemProps = <ValueType = unknown>(
  items: ObjectItem<ValueType>[],
  index: number,
  onChange: any
) => {
  const handlePropertyNameChange = (propertyName: string) => {
    const updated = items.map((item, idx) => (idx === index ? { ...item, propertyName } : item));
    onChange(updated);
  };

  const handlePropertyValueChange = (propertyValue: ValueType) => {
    const updated = items.map((item, idx) => (idx === index ? { ...item, propertyValue } : item));
    onChange(updated);
  };

  const handleDelete = () => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  return {
    onChange: handlePropertyValueChange,
    onDelete: handleDelete,
    onNameChange: handlePropertyNameChange,
  };
};

export function useObjectItems<ValueType = unknown>(
  items: ItemType<ValueType>,
  onChange: ChangeHandler<ItemType<ValueType>>
): ObjectItemState<ValueType> {
  const [cache, setCache] = useState(generateObjectEntries(items));

  useEffect(() => {
    const newCache = generateObjectEntries(items);

    if (
      !isEqual(
        newCache.map(({ id, ...rest }) => rest),
        cache.map(({ id, ...rest }) => rest)
      )
    ) {
      setCache(generateObjectEntries(items));
    }
  }, [items]);

  const handleChange = (items) => {
    setCache(items);
    onChange(items.reduce((acc, { propertyName, propertyValue }) => ({ ...acc, [propertyName]: propertyValue }), {}));
  };

  const addProperty = (name = '', value?: ValueType) => {
    if (!cache.some(({ propertyName }) => propertyName === name)) {
      handleChange([...cache, createObjectItem(name, value)]);
    }
  };

  return { addProperty, objectEntries: cache, onChange: handleChange };
}
