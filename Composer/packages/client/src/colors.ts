// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Color from 'color';
import { SharedColors } from '@uifabric/fluent-theme';

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
}

export const colors = new Colors();
