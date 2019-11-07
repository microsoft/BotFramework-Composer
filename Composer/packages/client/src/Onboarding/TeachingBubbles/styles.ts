/* eslint-disable prettier/prettier */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createTheme, ITeachingBubbleStyles, ITheme } from 'office-ui-fabric-react';

import { palette } from '../palette';

export const teachingBubbleTheme: ITheme = createTheme({
  defaultFontStyle: {
    color: palette.white,
  },
  palette,
});

export const teachingBubbleStyles: Partial<ITeachingBubbleStyles> = {
  footer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    selectors: {
      span: {
        marginRight: 'auto',
      },
      '.ms-Button:first-child': {
        marginLeft: '10px',
      },
    },
  },
  primaryButton: {
    background: '#ffffff',
    selectors: {
      ':active': {
        background: '#dadada',
      },
      ':hover': {
        background: '#f4f4f4',
      },
    },
  },
};
