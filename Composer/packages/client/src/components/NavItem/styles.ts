// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';
import { NeutralColors, CommunicationColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';

export const link = (active: boolean, disabled: boolean) => css`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${disabled ? '#999' : '#4f4f4f'};
  position: relative;

  width: 220px;

  ${active
    ? `background-color: ${NeutralColors.white};
 
     border-left: 3px solid ${CommunicationColors.primary};
    `
    : `
     background-color: transparent;
    `}

  ${disabled
    ? `pointer-events: none;`
    : `&:hover {
      background-color: ${NeutralColors.gray50};
    }

    &:focus {
      outline: none;
      .ms-Fabric--isFocusVisible &::after {
        content: "";
        position: absolute;
        z-index: 1;
        border: 1px solid ${NeutralColors.white};
        border-image: initial;
        outline: rgb(102, 102, 102) solid 1px;
      }
    }
  `}
`;

export const icon = (active: boolean, disabled: boolean) =>
  ({
    root: {
      color: active ? '#000' : disabled ? '#999' : '#4f4f4f',
      padding: '8px 12px',
      marginLeft: '4px',
      marginRight: '12px',
      boxSizing: 'border-box',
      fontSize: `${FontSizes.size16}`,
      width: '40px',
    },
  } as IButtonStyles);
