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
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';

export const fileList = css`
  width: 255px;
`;

export const linkItem = disabled => css`
  display: block;
  text-decoration: none;
  color: ${disabled ? '#A6A6A6' : '#4f4f4f'};
  position: relative;

  &:focus {
    outline: none;
  }
`;

export const contentEditor = css`
  margin: 0px 10px;
  border: 1px solid rgb(237, 235, 233);
`;

export const title = css`
  font-weight: bold;
  padding: 7px 10px;
  line-height: 14px;
  font-size: ${FontSizes.medium};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${NeutralColors.gray20};
`;
