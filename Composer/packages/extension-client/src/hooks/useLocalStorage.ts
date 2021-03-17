/* eslint-disable no-underscore-dangle */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useCallback } from 'react';

const KEY = 'composer:extensions';

export function useLocalStorage() {
  const { __extensionId, __bundleId } = window.Composer;

  const getExtensionState = useCallback(() => {
    const allStatesString = window.localStorage.getItem(KEY);
    const allStates = allStatesString ? JSON.parse(allStatesString) : {};
    const extensionState = allStates?.[__extensionId] || {};
    return extensionState;
  }, [__extensionId]);

  const updateExtensionState = useCallback(
    (value = undefined) => {
      const allStatesString = window.localStorage.getItem(KEY);
      const allStates = allStatesString ? JSON.parse(allStatesString) : {};
      const extensionState = allStates?.[__extensionId] || {};
      if (value) {
        extensionState[__bundleId] = value;
      } else {
        delete extensionState[__bundleId];
      }
      allStates[__extensionId] = extensionState;
      window.localStorage.setItem(KEY, JSON.stringify(allStates));
    },
    [__extensionId, __bundleId]
  );

  const getAll = useCallback(() => {
    return getExtensionState()?.[__bundleId];
  }, [getExtensionState, __bundleId]);

  const getItem = useCallback(
    (key: string) => {
      return getAll()?.[key];
    },
    [getAll]
  );

  const setItem = useCallback(
    (key: string, value: any) => {
      const bundleState = getAll() || {};
      bundleState[key] = value;
      updateExtensionState(bundleState);
    },
    [getAll]
  );

  const replaceAll = useCallback(
    (value: any) => {
      updateExtensionState(value);
    },
    [updateExtensionState]
  );

  const clearAll = useCallback(() => {
    updateExtensionState();
  }, [updateExtensionState]);
  return { getItem, setItem, getAll, clearAll, replaceAll };
}
