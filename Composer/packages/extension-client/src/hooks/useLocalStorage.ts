// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';

const KEY = 'composer:extensions';

export function useLocalStorage() {
  const { __extensionId, __bundleId } = window.Composer;

  const getItem = useMemo(
    () => (key: string) => {
      const allStates = window.localStorage.getItem(KEY);
      if (allStates) {
        const extensionState = JSON.parse(allStates)?.[__extensionId];
        return extensionState?.[__bundleId]?.[key];
      }
      return undefined;
    },
    [__extensionId, __bundleId]
  );

  const setItem = useMemo(
    () => (key: string, value: string) => {
      const allStatesString = window.localStorage.getItem(KEY);
      const allStates = allStatesString ? JSON.parse(allStatesString) : {};
      let extensionState;
      if (allStates) {
        extensionState = allStates?.[__extensionId] || {};
        const bundleState = extensionState?.[__bundleId] || {};
        bundleState[key] = value;
        // eslint-disable-next-line no-underscore-dangle
        extensionState[__bundleId] = bundleState;
        // eslint-disable-next-line no-underscore-dangle
        allStates[__extensionId] = extensionState;
      }
      window.localStorage.setItem(KEY, JSON.stringify(allStates));
    },
    [__extensionId, __bundleId]
  );

  return { getItem, setItem };
}
