import { css } from '@emotion/core';
import { NeutralColors, Depths } from '@uifabric/fluent-theme';

export const main = css`
  height: calc(100vh - 105px);
  display: flex;
`;

export const sideBar = css`
  width: 80px;
  background-color: ${NeutralColors.gray20};
  height: 100%;
  box-shadow: ${Depths.depth8};
`;

export const content = css`
  height: 100%;
  overflow: hidden;
  z-index: 2;
  flex: 1;
`;
