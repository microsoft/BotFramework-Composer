// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import debounce from 'lodash/debounce';

import { ListEntity, ListEntityItem } from '../types';

const nameRegex = /^[a-zA-Z0-9-_]+$/;

const hasDuplicatesBeforeIndex = (value: string, values: string[], index: number) => {
  const foundIdx = values.findIndex((v) => v === value);

  return foundIdx !== -1 && foundIdx < index;
};

export const useListEntityValidation = (listEntity: ListEntity) => {
  const [nameError, setNameError] = React.useState('');
  const [itemErrors, setItemErrors] = React.useState<Record<string, string>>({});
  const touchedRef = React.useRef<Record<string, boolean>>({});

  const errorMessages = React.useMemo(
    () => ({
      missingNormalizedValue: formatMessage('Required'),
      duplicateNormalizedValue: formatMessage('Already used!'),
      name: formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.'),
    }),
    []
  );

  // Keeps track of touched inputs
  React.useEffect(() => {
    const map: Record<string, boolean> = {};

    listEntity.items.forEach((item) => {
      map[item.id] = true;
      if (item.normalizedValue && !touchedRef.current[item.id]) {
        touchedRef.current[item.id] = true;
      }
    });

    for (const touchedItem of Object.keys(touchedRef.current)) {
      if (!map[touchedItem]) {
        delete touchedRef.current[touchedItem];
      }
    }
  }, [listEntity.items]);

  const validateEntityName = React.useCallback(
    debounce(
      (name?: string) => {
        if (name && !nameRegex.test(name)) {
          setNameError(errorMessages.name);
        } else {
          setNameError('');
        }
      },
      300,
      { leading: true }
    ),
    []
  );

  // Validates entity name
  React.useEffect(() => {
    if (listEntity.name) {
      validateEntityName(listEntity.name);
    }
  }, [listEntity.name]);

  const validateEntityItems = React.useCallback(
    debounce(
      (items: ListEntityItem[]) => {
        if (items.length) {
          const itemErrors = items.reduce((acc, item, idx) => {
            const hasMissingError = !item.normalizedValue;
            const hasDuplicateError = hasDuplicatesBeforeIndex(
              item.normalizedValue,
              items.map((i) => i.normalizedValue),
              idx
            );
            if (hasMissingError) {
              acc[item.id] = errorMessages.missingNormalizedValue;
            } else if (hasDuplicateError) {
              acc[item.id] = errorMessages.duplicateNormalizedValue;
            }

            return acc;
          }, {} as Record<string, string>);

          setItemErrors(itemErrors);
        } else {
          setItemErrors({});
        }
      },
      300,
      { leading: true }
    ),
    []
  );

  // Validates normalized value of each sub list
  React.useEffect(() => {
    validateEntityItems(listEntity.items);
  }, [listEntity]);

  const hasErrors = React.useMemo(() => !!Object.keys(itemErrors).length || !!nameError, [
    itemErrors,
    nameError,
    listEntity.items,
  ]);

  return { hasErrors, itemErrors, nameError, itemsTouched: touchedRef.current };
};
