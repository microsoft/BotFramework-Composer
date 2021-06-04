// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Color from 'color';
import { SharedColors } from '@uifabric/fluent-theme';
import { createTheme } from '@uifabric/styling';

class Colors {
  // main background color
  bg = '#fff';
  // main theming color (BFC default is SharedColors.cyanBlue10)
  main = '#93f';
  textOnColor = '#fff'; // color of text on main-colored elements like buttons and headers

  private bgColor = Color(this.bg);

  isDark = this.bgColor.isDark();
  transparentBg = 'rgba(255, 255, 255, 0.5)';
  transparent = 'transparent';
  text = this.isDark ? '#fff' : '#000';

  private textColor = Color(this.text);
  inactiveText = Color({
    r: (this.bgColor.red() + this.textColor.red()) / 2,
    g: (this.bgColor.green() + this.textColor.green()) / 2,
    b: (this.bgColor.blue() + this.textColor.blue()) / 2,
  }).hex();

  black = '#000';

  mainLight = Color(this.main).lighten(0.5).hex();
  mainDark = Color(this.main).darken(0.5).hex();
  botControllerBg = Color(this.main).darken(0.3).hex();

  green = SharedColors.green10;
  red = SharedColors.red10;
  darkRed = SharedColors.red20;
  amber = SharedColors.orangeYellow10;

  gray = (value: number) => {
    const red = this.isDark ? value : 255 - value;
    return `rgb(${red}, ${red - 2}, ${red - 4})`;
  };

  // copied from https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/messaging
  errorBg = '#FED9CC';
  error = '#D83B01';
  warningBg = '#FFF4CE';
  warning = '#797673';
  successBg = '#DDF3DB';
  success = '#107C10';

  setMainColor = (hex: string) => {
    this.main = hex;
    this.mainLight = Color(this.main).lighten(0.5).hex();
    this.mainDark = Color(this.main).darken(0.5).hex();
  };

  fluentTheme = createTheme({
    palette: {
      themePrimary: this.main,
      themeLighterAlt: Color(this.main).lighten(0.9).hex(),
      themeLighter: Color(this.main).lighten(0.8).hex(),
      themeLight: Color(this.main).lighten(0.7).hex(),
      themeTertiary: Color(this.main).lighten(0.5).hex(),
      themeSecondary: Color(this.main).lighten(0.2).hex(),
      themeDarkAlt: Color(this.main).darken(0.9).hex(),
      themeDark: Color(this.main).darken(0.75).hex(),
      themeDarker: Color(this.main).darken(0.5).hex(),
      neutralLighterAlt: this.gray(0xfa),
      neutralLighter: this.gray(0xf3),
      neutralLight: this.gray(0xed),
      neutralQuaternaryAlt: this.gray(0xe1),
      neutralQuaternary: this.gray(0xd0),
      neutralTertiaryAlt: this.gray(0xc8),
      neutralTertiary: this.gray(0xa1),
      neutralSecondary: this.gray(0x60),
      neutralPrimaryAlt: this.gray(0x3b),
      neutralPrimary: this.gray(0x32),
      neutralDark: this.gray(0x20),
      black: this.text,
      white: this.bg,
    },
  });
}

export const colors = new Colors();
