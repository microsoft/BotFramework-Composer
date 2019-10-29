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
import { IPivotStyles } from 'office-ui-fabric-react';
import { css } from '@emotion/core';

export const tabs: Partial<IPivotStyles> = {
  root: {
    display: 'flex',
    padding: '0 18px',
  },
  link: {
    flex: 1,
  },
  linkIsSelected: {
    flex: 1,
  },
  itemContainer: {
    padding: '24px 18px',
  },
};

export const tabsContainer = css`
  border-bottom: 1px solid #c8c6c4;
`;

export const validationItem = css`
  display: flex;
  align-items: center;
  padding-left: 10px;

  & + & {
    margin-top: 10px;
  }
`;

export const validationItemValue = css`
  flex: 1;
`;

export const field = css`
  margin: 10px 0;
`;

export const settingsContainer = css`
  /* padding: 24px 0; */
`;

export const settingsFields = css`
  display: flex;
  flex-wrap: wrap;
`;

export const settingsFieldFull = css`
  flex-basis: 100%;
`;

export const settingsFieldHalf = css`
  flex: 1;

  & + & {
    margin-left: 36px;
  }
`;

export const settingsFieldInline = css`
  margin: 0;
`;

export const choiceItemContainer = (align = 'center') => css`
  display: flex;
  align-items: ${align};
`;

export const choiceItemValue = css`
  width: 180px;
`;

export const choiceItemSynonyms = css`
  flex: 1;
  margin-left: 20px;
`;
