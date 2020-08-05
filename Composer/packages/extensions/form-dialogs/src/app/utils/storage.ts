// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SnapshotOut } from 'mobx-state-tree';
import { MutableSettingsStore } from 'src/app/stores/settingsStore';
import { MutableDataStore } from 'src/app/stores/dataStore';

const settingsKey = `demo-settings-`;
const dataStoreKey = `demo-data-`;

export const getSettingsSnapshot = (editorId: string): SnapshotOut<MutableSettingsStore> => {
  const settingsJsonString = localStorage.getItem(`${settingsKey}${editorId}`);
  return settingsJsonString && JSON.parse(settingsJsonString);
};

export const saveSettingsSnapshot = (editorId: string, settingsSnapshot: SnapshotOut<MutableSettingsStore>) => {
  localStorage.setItem(`${settingsKey}${editorId}`, JSON.stringify(settingsSnapshot));
};

export const getDatastoreSnapshot = (editorId: string): SnapshotOut<MutableDataStore> => {
  const dataStoreJsonString = localStorage.getItem(`${dataStoreKey}${editorId}`);
  return dataStoreJsonString && JSON.parse(dataStoreJsonString);
};

export const saveDataStoreSnapshot = (editorId: string, dataStoreSnapshot: SnapshotOut<MutableDataStore>) => {
  localStorage.setItem(`${dataStoreKey}${editorId}`, JSON.stringify(dataStoreSnapshot));
};

export const clearStorage = (editorId: string) => {
  localStorage.removeItem(`${settingsKey}${editorId}`);
  localStorage.removeItem(`${dataStoreKey}${editorId}`);
};
