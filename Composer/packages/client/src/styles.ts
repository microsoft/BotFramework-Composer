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
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

export const main = css`
  height: calc(100vh - 50px);
  display: flex;
`;

export const sideBar = isExpand => css`
  width: ${isExpand ? '220' : '48'}px;
  background-color: ${NeutralColors.gray20};
  height: 100%;
  transition: width 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  flex-shrink: 0;
`;

export const dividerTop = css`
  width: 100%;
  border-bottom: 1px solid ${NeutralColors.gray40};
  margin: 0 auto;
`;

export const divider = isExpand => css`
  width: ${isExpand ? '85%' : '40%'};
  border-bottom: 1px solid ${NeutralColors.gray40};
  margin: 0 auto;
`;

export const globalNav = css`
  height: 44px;
  width: 48px;
  text-align: center;
  line-height: 44px;
  cursor: pointer;
  font-size: ${FontSizes.size16};
  color: #106ebe;
  &:hover {
    background: ${NeutralColors.gray40};
  }
`;

export const content = css`
  outline: none;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const showDesign = show => css`
  display: ${show ? 'block' : 'none'} !important;
`;

export const leftNavBottom = () => css`
  height: 90px;
`;

export const rightPanel = () => css`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export const data = css`
  height: calc(100vh - 50px);
`;

export const bot = css`
  display: flex;
  align-items: center;
  position: relative;
  height: 100%;
`;

export const botButton = css`
  margin-left: 15px;
`;

export const calloutLabel = css`
  font-size: ${FontSizes.size18};
  font-weight: ${FontWeights.bold};
`;

export const calloutContainer = css`
  width: 400px;
  padding: 10px;
`;

export const calloutDescription = css``;

export const calloutAction = css``;
