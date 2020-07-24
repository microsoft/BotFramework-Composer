// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateUniqueId } from '@bfc/shared';
import { ChangeHandler } from '@bfc/extension';
import { useState } from 'react';

type ItemType<T> = { [key: string]: T };
type ObjectChangeHandler = (items: ObjectItem[]) => void;

export interface ObjectItem {
  id: string;
  propertyName: string;
  propertyValue?: unknown;
}

interface ObjectItemState {
  objectEntries: ObjectItem[];
  onChange: ObjectChangeHandler;
  addProperty: (name?: string, value?: unknown) => void;
}

const generateObjectEntries = (value: ItemType<unknown>): ObjectItem[] => {
  return Object.entries(value || {}).map((entry) => createObjectItem(...entry));
};

const createObjectItem = (propertyName = '', propertyValue?: unknown): ObjectItem => {
  return {
    id: generateUniqueId(),
    propertyName,
    propertyValue,
  };
};

export const getPropertyItemProps = (items: ObjectItem[], index: number, onChange: any) => {
  const handlePropertyNameChange = (propertyName: string) => {
    const updated = items.map((item, idx) => (idx === index ? { ...item, propertyName } : item));
    onChange(updated);
  };

  const handlePropertyValueChange = (propertyValue: ObjectItem) => {
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

export function useObjectItems(items: ItemType<unknown>, onChange: ChangeHandler<ItemType<unknown>>): ObjectItemState {
  const [cache, setCache] = useState(generateObjectEntries(items));

  const handleChange = (items: ObjectItem[]) => {
    setCache(items);
    onChange(
      items.reduce(
        (acc, { propertyName, propertyValue }) => ({ ...acc, [propertyName]: propertyValue }),
        {} as ItemType<unknown>
      )
    );
  };

  const addProperty = <ValueType = unknown>(name: string = '', value?: ValueType) => {
    if (!cache.some(({ propertyName }) => propertyName === name)) {
      handleChange([...cache, createObjectItem(name, value)]);
    }
  };

  return { addProperty, objectEntries: cache, onChange: handleChange };
}
