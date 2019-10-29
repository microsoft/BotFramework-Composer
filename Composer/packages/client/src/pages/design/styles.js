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
import { mergeStyleSets, FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';

export const pageRoot = css`
  height: 100%;
  display: flex;
  flex-direction: row;
`;

export const contentWrapper = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const projectContainer = css`
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  width: 255px;
`;

//remove TODO
export const projectWrapper = css``;

export const projectHeader = css`
  font-weight: bold;
  padding: 7px 10px;
  line-height: 14px;
  font-size: ${FontSizes.medium};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${NeutralColors.gray20};
`;

export const projectTree = css`
  flex-grow: 3;
  flex-shrink: 3;
`;

export const assetTree = css`
  flex-grow: 2;
  flex-shrink: 2;
`;
/*******/

export const editorContainer = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 4;
`;

export const editorWrapper = css`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
`;

export const visualPanel = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  border-right: 1px solid #c4c4c4;
  position: relative;
`;

export const visualEditor = css`
  border: 0px;
  flex: 1;
  background-color: #e5e5e5;
`;

export const formEditor = css`
  max-width: 600px;
  flex: 1;
  border: 0px;
  transition: width 0.2s ease-in-out;
`;

export const breadcrumbClass = mergeStyleSets({
  root: {
    margin: '0',
    padding: '10px',
  },
  itemLink: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semilight,
    color: '#333',
    padding: '4px 8px',
  },
  chevron: {
    fontSize: FontSizes.mini,
  },
});

export const deleteDialogContent = css`
  color: #000;
`;

export const middleTriggerContainer = css`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #e5e5e5;
  width: 100%;
  margin-top: 48px;
  height: calc(100% - 48px);
  position: absolute;
`;

export const middleTriggerElements = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 18px;
  line-height: 24px;
  color: #828282;
`;

export const triggerButton = css`
  font-size: 12px;
  color: #0078d4;
`;
