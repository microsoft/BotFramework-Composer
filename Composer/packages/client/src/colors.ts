// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Color from 'color';
import { SharedColors } from '@uifabric/fluent-theme';

class Colors {
  //bg = NeutralColors.white;
  bg = '#ffffff';
  bgColor = Color(this.bg);
  transparentBg = 'rgba(255, 255, 255, 0.5)';
  transparent = 'transparent';
  text = this.bgColor.isDark() ? '#fff' : '#000';
  textColor = Color(this.text);
  inactiveText = Color({
    r: (this.bgColor.red() + this.textColor.red()) / 2,
    g: (this.bgColor.green() + this.textColor.green()) / 2,
    b: (this.bgColor.blue() + this.textColor.blue()) / 2,
  }).hex();

  black = '#000';

  textOnColor = '#fff';

  main = '#ff8000';
  mainLight = Color(this.main).lighten(0.5).hex();
  mainDark = Color(this.main).darken(0.5).hex();
  botControllerBg = Color(this.main).darken(0.2).hex();

  green = SharedColors.green10;
  red = SharedColors.red10;
  darkRed = SharedColors.red20;
  amber = SharedColors.orangeYellow10;

  gray = (value: number) => {
    const red = 255 - value;
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
