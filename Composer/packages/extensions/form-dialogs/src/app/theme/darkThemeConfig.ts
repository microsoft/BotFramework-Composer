// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ThemeConfig } from 'src/app/theme/themeConfig';
import { createTheme } from '@fluentui/react/lib/Styling';

export const darkThemeConfig: ThemeConfig = {
  themePrimary: '#0078d4',
  themeLighterAlt: '#eff6fc',
  themeLighter: '#deecf9',
  themeLight: '#c7e0f4',
  themeTertiary: '#71afe5',
  themeSecondary: '#2b88d8',
  themeDarkAlt: '#106ebe',
  themeDark: '#005a9e',
  themeDarker: '#004578',
  neutralLighterAlt: '#0b0b0b',
  neutralLighter: '#151515',
  neutralLight: '#252525',
  neutralQuaternaryAlt: '#2f2f2f',
  neutralQuaternary: '#373737',
  neutralTertiaryAlt: '#595959',
  neutralTertiary: '#c8c8c8',
  neutralSecondary: '#d0d0d0',
  neutralPrimaryAlt: '#dadada',
  neutralPrimary: '#ffffff',
  neutralDark: '#f4f4f4',
  black: '#f8f8f8',
  white: '#000000',
};

export const fabricDarkTheme = createTheme({
  palette: darkThemeConfig,
});
