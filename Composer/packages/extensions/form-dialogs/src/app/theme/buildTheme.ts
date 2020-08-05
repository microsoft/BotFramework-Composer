// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ThemeConfig } from 'src/app/theme/themeConfig';
import { DefaultPalette } from '@fluentui/react/lib/Styling';

export const buildTheme = (themeConfig: ThemeConfig) => {
  const { themePrimary, neutralDark, white, neutralSecondary, neutralTertiaryAlt, neutralLight } = themeConfig;

  return {
    AdvancedOptions: {
      color: themePrimary,
    },
    App: {
      backgroundColor: neutralTertiaryAlt,
    },
    PropertyItem: {
      backgroundColor: white,
      baseShadowColor: '#000',
      borderColor: neutralSecondary,
      handleColor: themePrimary,
      errorColor: DefaultPalette.red,
    },
    Tag: {
      backgroundColor: neutralLight,
      borderColor: neutralSecondary,
      color: neutralDark,
    },
    TagInput: {
      backgroundColor: white,
      outlineColor: themePrimary,
      borderColor: neutralSecondary,
      color: neutralDark,
      placeholderColor: neutralSecondary,
    },
    VisualEditor: {
      baseShadowColor: '#000',
    },
  };
};
