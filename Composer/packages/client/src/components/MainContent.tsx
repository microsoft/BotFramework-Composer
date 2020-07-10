// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const contentTopMargin = 10;
const contentBottomMargin = 0;

export const contentContainer = css`
  display: flex;
  height: calc(100vh - ${105 + contentTopMargin + contentBottomMargin}px);
  margin-top: ${contentTopMargin}px;
  margin-bottom: ${contentBottomMargin}px;
  margin-left: 20px;
`;

export const MainContent = (props: { children: Element }) => (
  <div css={contentContainer} role="main">
    {props.children}
  </div>
);
