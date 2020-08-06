// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';

export type MutableSettingsStore = Instance<typeof SettingsStore>;
export type SettingsStore = DeepNoFunction<MutableSettingsStore>;

export const SettingsStore = types
  .model('SettingsStore', {
    themeName: types.frozen<ThemeName>('light'),
  })
  .actions((self) => ({
    update: (props: Partial<Pick<SnapshotIn<typeof self>, 'themeName'>>) => {
      Object.assign(self, props);
    },
  }));

export const createSettingsStore = (snapshot?: SnapshotOut<MutableSettingsStore>) => {
  const defaultSettings: SnapshotOut<MutableSettingsStore> = {
    themeName: 'light',
  };

  return snapshot ? SettingsStore.create({ ...defaultSettings, ...snapshot }) : SettingsStore.create(defaultSettings);
};
