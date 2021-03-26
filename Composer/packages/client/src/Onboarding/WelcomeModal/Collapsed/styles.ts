// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { FluentTheme } from '@uifabric/fluent-theme';

export const content = css`
  color: ${FluentTheme.palette.white};
  display: flex;
  padding: 10px;
  justify-content: space-between;
  align-items: center;
`;

export const buttonStyles: IButtonStyles = {
  icon: {
    color: FluentTheme.palette.white,
  },
  root: {
    selectors: {
      ':hover .ms-Button-icon': {
        background: FluentTheme.palette.themeDarkAlt,
        color: FluentTheme.palette.white,
      },
      ':active .ms-Button-icon': {
        background: FluentTheme.palette.themeDark,
        color: FluentTheme.palette.white,
      },
    },
  },
  rootHovered: { backgroundColor: FluentTheme.palette.themeDarkAlt },
  rootPressed: { backgroundColor: FluentTheme.palette.themeDark },
};
