import { DialogGroup } from 'shared-menus';

const Colors = {
  // Neutral Colors
  Black: '#000000',
  AzureGray: '#3C3C41',
  AzureGray2: '#656565',
  AzureGray3: '#EBEBEB',
  Gray80: '#B3B0AD',
  Gray60: '#C8C6C4',

  // Composer Bright and Darks with white text
  RedOrange: '#DA3B01',
  RedOrg20: 'rgba(218, 59, 1, 0.2)',
  Orange20: '#CA5010',
  Cyan20: '#038387',
  CyanBlue20: '#004E8C',
  AzureBlue: '#0078D4',
  AzureBlue2: '#50E6FF',
  LightBlue: '#E5F0FF',
  Green20: '#0B6A0B',
  Cyan40: '#005E50',
  Gray20: '#69797E',
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

export const EventColor = {
  expanded: Colors.AcidGreen,
  iconColor: Colors.DarkGreen,
  collapsed: Colors.DarkGreen,
};

export const NodeColors = {
  [DialogGroup.INPUT]: {
    themeColor: Colors.LightBlue,
    iconColor: Colors.AzureBlue,
  },
  [DialogGroup.BRANCHING]: {
    themeColor: Colors.AzureGray3,
    iconColor: Colors.AzureGray2,
  },
  [DialogGroup.MEMORY]: {
    themeColor: Colors.AzureGray3,
    iconColor: Colors.AzureGray2,
  },
  [DialogGroup.CODE]: {
    themeColor: Colors.AzureGray3,
    iconColor: Colors.AzureGray2,
  },
  [DialogGroup.LOG]: {
    themeColor: Colors.AzureGray3,
    iconColor: Colors.AzureGray2,
  },
  [DialogGroup.RESPONSE]: {
    themeColor: Colors.BlueMagenta20,
    iconColor: Colors.BlueMagenta30,
  },
  [DialogGroup.STEP]: {
    themeColor: Colors.AzureGray2,
  },
  [DialogGroup.OTHER]: {
    themeColor: Colors.AzureGray3,
    iconColor: Colors.AzureGray2,
  },
};
