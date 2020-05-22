// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';

import { palette } from '../../palette';

export const content = css`
  color: ${palette.white};
  display: flex;
  padding: 10px;
  justify-content: space-between;
  align-items: center;
`;

export const buttonStyles: IButtonStyles = {
  icon: {
    color: palette.white,
  },
  root: {
    selectors: {
      ':hover .ms-Button-icon': {
        background: palette.themeDarkAlt,
        color: palette.white,
      },
      ':active .ms-Button-icon': {
        background: palette.themeDark,
        color: palette.white,
      },
    },
  },
  rootHovered: { backgroundColor: palette.themeDarkAlt },
  rootPressed: { backgroundColor: palette.themeDark },
};
