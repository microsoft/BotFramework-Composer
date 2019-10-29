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
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { css } from '@emotion/core';

export const headerContainer = css`
  position: relative;
  background: ${NeutralColors.black};
  height: 50px;
  line-height: 50px;
`;

export const title = css`
  position: relative;
  margin-left: 25px;
  font-weight: ${FontWeights.semibold};
  font-size: 16px;
  color: #fff;
  bottom: 11px;
  &::after {
    content: '';
    position: absolute;
    top: 0px;
    right: -15px;
    bottom: 11px;
    width: 0px;
    height: 24px;
    border: none;
    border-right: 1px solid #979797;
    border-image: initial;
    outline: none;
  }
`;

export const botName = css`
  position: absolute;
  margin-left: 30px;
  font-size: 16px;
  color: #fff;
`;
