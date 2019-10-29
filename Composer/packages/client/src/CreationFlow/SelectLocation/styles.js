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

export const choice = {
  root: {
    border: '1px solid #979797',
    height: '200px',
    padding: '5px',
    marginRight: '90px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
};

export const option = {
  root: {
    height: '32px',
    width: '290px',
  },
  choiceFieldWrapper: {
    width: '100%',
    height: '100%',
  },
};

export const itemIcon = css`
  position: absolute;
  left: 7px;
  top: 7px;
  vertical-align: text-bottom;
  font-size: 18px;
  color: #0078d4;
`;

export const itemText = css`
  margin-left: 40px;
  line-height: 32px;
`;

export const itemRoot = checked => css`
  width: 100%;
  height: 100%;
  background: ${checked ? '#EDEBE9' : 'transparent'};
`;

export const error = css`
  color: #a80000;
  margin-bottom: 5px;
`;
