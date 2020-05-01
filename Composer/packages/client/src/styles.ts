// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';

export const main = css`
  height: calc(100vh - 50px);
  display: flex;
`;

export const sideBar = isExpand => css`
  width: ${isExpand ? '220' : '48'}px;
  background-color: ${NeutralColors.gray20};
  height: 100%;
  border-right: 1px solid ${NeutralColors.gray50};
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
    background: ${NeutralColors.gray50};
  }
`;

export const content = css`
  outline: none;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;

  label: Content;
`;

export const showDesign = show => css`
  display: ${show ? 'block' : 'none'} !important;
  height: 100%;
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
