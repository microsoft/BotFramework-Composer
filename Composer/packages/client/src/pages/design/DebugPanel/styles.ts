// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';

export const expandedPanelHeaderHeight = 36;
export const collapsedPaneHeaderHeight = 32;
export const debugPanelMaxExpandedHeight = 500;
export const debugPanelDefaultHeight = 400;
export const debugPanelMinHeight = 300;

export const debugPaneContainerStyle = css`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const debugPaneHeaderStyle = css`
  border-top: 1px solid #dfdfdf;
`;

export const debugPaneContentStyle = css`
  height: calc(100% - ${expandedPanelHeaderHeight}px);
  overflow-y: hidden;
  overflow-x: auto;
`;

export const debugPaneFooterStyle = css`
  height: ${collapsedPaneHeaderHeight}px;
  border-top: 1px solid #dfdfdf;
`;

export const debugPaneBarStyle = css`
  display: flex;
  justify-content: space-between;
  background: #faf9f8;
`;

export const leftBarStyle = css`
  padding: 0 16px;
`;

export const rightBarStyle = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
