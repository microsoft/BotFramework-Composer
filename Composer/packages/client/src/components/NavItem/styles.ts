/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { css } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';
import { NeutralColors, CommunicationColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react';

export const link = (active, underTest) => css`
  display: block;
  text-decoration: none;
  color: #4f4f4f;
  position: relative;

  ${underTest && `pointer-events: none;`}
  ${!underTest &&
    `&::after {
      content: '';
      position: absolute;
      top: 0px;
      right: 1px;
      bottom: 0px;
      left: 1px;
    }

    &:hover {
      background-color: ${active ? NeutralColors.gray40 : NeutralColors.gray30};
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

    ${active &&
      `background-color: ${NeutralColors.gray40};

      &::after {
        border-left: 3px solid ${CommunicationColors.primary};
      }`}
  `}
`;

export const outer = css`
  display: flex;
  width: 220px;
  background-color: transparent;
`;

export const commandBarButton = active =>
  ({
    root: {
      color: active ? '#000' : '#4f4f4f',
      height: '36px',
      width: '220px',
      fontSize: `${FontSizes.size14}`,
      paddingLeft: '0px',
      paddingRight: '0px',
      marginLeft: '0px',
      backgroundColor: 'transparent',
    },
    rootDisabled: {
      backgroundColor: 'transparent',
    },
    icon: {
      color: active ? '#000' : '#4f4f4f',
      padding: '0 16px',
      marginLeft: '0px',
      boxSizing: 'border-box',
      fontSize: `${FontSizes.size16}`,
    },
    textContainer: {
      textAlign: 'left',
      zIndex: 1,
    },
  } as IButtonStyles);
