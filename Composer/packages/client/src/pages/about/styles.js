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

export const outline = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 32px 50px 0px 32px;
  border: 1px solid #979797;
  overflow-x: auto;
`;

export const content = css`
  height: 100%;
`;

export const title = css`
  display: block;
  height: 36px;
  margin: 33px 0px 0px 42px;
  font-size: 36px;
  line-height: 32px;
`;

export const body = css`
  width: auto;
  margin-top: 26px;
  margin-left: 60px;
`;

export const version = css`
  font-size: 24px;
  line-height: 32px;
`;

export const description = css`
  font-size: 20px;
  line-height: 32px;
  width: 50%;
  margin-top: 20px;
`;

export const DiagnosticsText = css`
  width: 50%;
  font-size: 24px;
  margin-top: 20px;
`;

export const smallText = css`
  margin-top: 20px;
  font-size: 13px;
`;
export const DiagnosticsInfoText = css`
  display: flex;
  justify-content: space-between;
  width: 460px;
  font-size: 24px;
`;

export const DiagnosticsInfoTextAlignLeft = css`
  width: 50%;
  text-align: left;
`;

export const DiagnosticsInfo = css`
  margin-top: 40px;
`;

export const linkContainer = css`
  display: flex;
  margin-left: 35px;
  flex-direction: column;
  height: 110px;
  margin-top: 15px;
`;

export const linkTitle = css`
  font-size: 24px;
`;

export const linkRow = css`
  display: flex;
  width: 400px;
`;

export const link = css`
  font-size: 20px;
  color: #0078d4;
  margin-left: 10px;
`;

export const helpLink = css`
  font-size: 24px;
  color: #0078d4;
  margin-left: 60px;
`;

export const icon = {
  icon: {
    color: '#0078d4',
    fontSize: '20px',
  },
};
