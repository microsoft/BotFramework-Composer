// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createTheme, ITheme } from 'office-ui-fabric-react/lib/Styling';
import { ITeachingBubbleStyles } from 'office-ui-fabric-react/lib/TeachingBubble';

import { palette } from '../palette';

export const teachingBubbleTheme: ITheme = createTheme({
  defaultFontStyle: {
    color: palette.themePrimary,
  },
  palette,
});

export const teachingBubbleStyles: Partial<ITeachingBubbleStyles> = {
  bodyContent: {
    selectors: {
      a: {
        color: palette.white,
      },
    },
  },
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
      ':focus': {
        background: '#f4f4f4',
      },
    },
  },
};
