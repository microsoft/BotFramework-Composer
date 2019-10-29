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

export const choiceGroup = {
  flexContainer: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignContent: 'baseline',
  },
};

export const templateItem = (checked, disabled) => css`
  height: 70px;
  width: 80px;
  margin: 5px;
  background: #ebebeb;
  color: ${disabled ? '#A19F9D' : '#0078d4'};
  font-size: 13px;
  box-sizing: border-box;
  border-top: 6px solid ${disabled ? '#A19F9D' : '#50e6ff'};
  outline: ${disabled ? 'none' : checked ? '2px solid #50e6ff' : 'none'};
  cursor: pointer;
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 13px;
`;

export const optionIcon = checked => css`
  vertical-align: text-bottom;
  font-size: 18px;
  margin-right: 10px;
  color: ${checked ? '#0078d4' : '#000'};
`;

export const optionRoot = css`
  width: 100%;
  height: 100%;
`;

export const placeholder = css`
  line-height: 30px;
  height: 30px;
  padding-left: 5px;
`;
