// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import { ExtensionSettings } from '@botframework-composer/types';

import { validateHookContext } from '../utils/validateHookContext';

export function useExtensionSettings<T extends ExtensionSettings>(defaultSettings: T) {
  validateHookContext('settings');

  return useMemo(() => {
    const { __extensionId, settings } = window.Composer;

    if (!__extensionId) {
      return defaultSettings;
    }

    return Object.entries(settings ?? {}).reduce((all, [key, value]) => {
      if (key.startsWith(__extensionId)) {
        all[key.replace(`${__extensionId}.`, '')] = value;
      }

      return all;
    }, {}) as T;
  }, []);
}
