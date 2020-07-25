// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HandlerDependencies } from 'src/app/dispatcher/types';

export type SettingsAction = ReturnType<typeof createSettingsHandler>;

export const createSettingsHandler = ({ settingsStore }: HandlerDependencies) => {
  const changeTheme = ({ themeName }: { themeName: ThemeName }) => {
    settingsStore.update({ themeName });
  };

  return { changeTheme };
};
