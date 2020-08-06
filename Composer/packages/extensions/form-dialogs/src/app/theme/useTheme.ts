// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Customizations } from '@fluentui/react/lib/Utilities';
import { reaction } from 'mobx';
import { useEffect } from 'react';
import { SettingsStore } from 'src/app/stores/settingsStore';
import { darkThemeConfig, fabricDarkTheme } from 'src/app/theme/darkThemeConfig';
import { fabricLightTheme, lightThemeConfig } from 'src/app/theme/lightThemeConfig';
import { setTheme } from 'src/app/theme/stylist';

export const useTheme = (settingsStore?: SettingsStore) => {
  useEffect(() =>
    reaction(
      () => settingsStore?.themeName,
      (themeName) => {
        switch (themeName) {
          case 'dark':
            setTheme(darkThemeConfig);
            Customizations.applySettings({ theme: fabricDarkTheme });
            break;
          case 'light':
          default:
            setTheme(lightThemeConfig);
            Customizations.applySettings({ theme: fabricLightTheme });
        }
      },
      { fireImmediately: true }
    )
  );
};
