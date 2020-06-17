// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const Colors = {
  // Neutral Colors
  Black: '#000000',
  AzureGray: '#3C3C41',
  AzureGray2: '#656565',
  AzureGray3: '#D7D7D7',
  Gray80: '#B3B0AD',
  Gray60: '#C8C6C4',
  White: '#FFFFFF',

  // Composer Bright and Darks with white text
  RedOrange: '#DA3B01',
  RedOrg20: 'rgba(218, 59, 1, 0.2)',
  Orange20: '#CA5010',
  Cyan20: '#038387',
  CyanBlue20: '#004E8C',
  AzureBlue: '#0078D4',
  AzureBlue2: '#50E6FF',
  LightBlue: '#E5F0FF',
  DarkBlue: '#004578',
  Green20: '#0B6A0B',
  Cyan40: '#005E50',
  Gray20: '#69797E',
  LightGray: '#545454',
  BlueMagenta30: '#5C2E91',
  BlueMagenta20: '#EEEAF4',
  Magenta10: '#C239B3',
  Magenta20: 'rgba(194, 57, 179, 0.2)',
  MagentaPink10: '#E3008C',
  Gray40: '#393939',
  Gray30: '#7A7574',

  // Composer Bright black text
  Cyan10: '#00B7C3',
  CyanLight: '#BFEAE9',

  AcidGreen: '#B8D997',
  DarkGreen: '#7ABD37',

  YellewGreen10: '#8CBD18',
  YellewGreen40: 'rgba(140, 189, 24, 0.4)',
};

export const ObiColors = Colors;

export interface ElementColor {
  theme?: string;
  icon?: string;
  color?: string;
}

export const DefaultColors: ElementColor = {
  theme: ObiColors.AzureGray3,
  icon: ObiColors.AzureGray2,
  color: ObiColors.Black,
};
