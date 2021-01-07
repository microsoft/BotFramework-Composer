// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NeutralColors, CommunicationColors, SharedColors } from '@uifabric/fluent-theme';

class Colors {
  bg = NeutralColors.white;
  transparentBg = 'rgba(255, 255, 255, 0.5)';
  transparent = 'transparent';

  textOnColor = NeutralColors.white;

  botControllerBg = CommunicationColors.tint10;

  green = SharedColors.green10;
  red = SharedColors.red10;
  darkRed = SharedColors.red20;
  blue = SharedColors.cyanBlue10;
  amber = SharedColors.orangeYellow10;
  black = '#000';

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

  latestBotItem = '#56ccf2';
  shade30 = '#004578';
}

export const colors = new Colors();
