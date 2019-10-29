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
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { FontWeights } from '@uifabric/styling';

export const textFieldlabel = {
  root: [
    {
      fontWeight: FontWeights.semibold,
    },
  ],
};

export const dropdown = {
  subComponentStyles: {
    label: textFieldlabel,
  },
  // root: [
  //   {
  //     marginTop: '2rem',
  //   },
  // ],
};

export const backIcon = css`
  font-size: 20px;
  cursor: pointer;
  transform: rotate(90deg);
  width: 20px;
  height: 20px;
  margin: 18px 0px 0px 3px;
  padding: 8px;
  &: hover {
    background-color: rgb(244, 244, 244);
  }
`;

export const detailListContainer = css`
  position: relative;
  padding-top: 20px;
  overflow: hidden;
  flex-grow: 1;
`;

export const fileSelectorContainer = css`
  height: 300px;
  display: flex;
  flex-direction: column;
`;

export const pathNav = css`
  display: flex;
`;

export const loading = css`
  height: 50vh;
  width: 600px;
`;

export const detailListClass = mergeStyleSets({
  fileIconHeaderIcon: {
    padding: 0,
    fontSize: '16px',
  },
  fileIconCell: {
    textAlign: 'center',
    selectors: {
      '&:before': {
        content: '.',
        display: 'inline-block',
        verticalAlign: 'middle',
        height: '100%',
        width: '0px',
        visibility: 'hidden',
      },
    },
  },
  fileIconImg: {
    verticalAlign: 'middle',
    maxHeight: '16px',
    maxWidth: '16px',
  },
});
