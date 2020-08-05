// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { onSnapshot } from 'mobx-state-tree';
import { createDataStore } from 'src/app/stores/dataStore';
import { createSettingsStore } from 'src/app/stores/settingsStore';
import {
  getDatastoreSnapshot,
  getSettingsSnapshot,
  saveDataStoreSnapshot,
  saveSettingsSnapshot,
} from 'src/app/utils/storage';
import { partial } from 'src/app/utils/functional';

export const startup = (editorId: string, options?: { snapshot: boolean }) => {
  options = options || { snapshot: false };
  const settingsSnapshot = options.snapshot ? getSettingsSnapshot(editorId) : null;
  const dataStoreSnapshot = options.snapshot ? getDatastoreSnapshot(editorId) : null;

  const settingsStore = createSettingsStore(settingsSnapshot);
  const dataStore = createDataStore(dataStoreSnapshot);

  if (options.snapshot) {
    onSnapshot(settingsStore, partial(saveSettingsSnapshot, editorId));
    onSnapshot(dataStore, partial(saveDataStoreSnapshot, editorId));
  }

  return {
    dataStore,
    settingsStore,
  };
};
