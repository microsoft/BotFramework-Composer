// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';

export const DebugPaneHeaderHeight = 36;

export const DebugPaneFooterHeight = 24;

export const debugPaneContainerExpandedStyle = css`
  height: 300px;
  display: flex;
  flex-direction: column;
`;

export const debugPaneHeaderStyle = css`
  height: ${DebugPaneHeaderHeight}px;
  border-top: 1px solid #dfdfdf;
`;

export const debugPaneContentStyle = css`
  height: calc(100% - ${DebugPaneHeaderHeight}px);
  overflow-x: auto;
`;

export const statusBarStyle = css`
  height: ${DebugPaneFooterHeight}px;
  border-top: 1px solid #dfdfdf;
`;

export const debugPaneBarStyle = css`
  display: flex;
  justify-content: space-between;
  background: #faf9f8;
`;

export const leftBarStyle = css``;

export const rightBarStyle = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
