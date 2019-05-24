import { css, keyframes } from '@emotion/core';
import { NeutralColors, Depths, SharedColors, FontSizes } from '@uifabric/fluent-theme';

export const spreadToRight = keyframes`
  from {
    width: 40px;
  }
  to {
    width: 200px; 
  }
`;

export const fadeToLeft = keyframes`
  from {
    width: 200px;
  }
  to {
    width: 40px; 
  }
`;

export const main = css`
  height: calc(100vh - 105px);
  display: flex;
`;

export const sideBar = isSpread => css`
  width: ${isSpread ? '200' : '40'}px;
  background-color: ${NeutralColors.gray20};
  height: 100%;
  box-shadow: ${Depths.depth8};
  animation-name: ${isSpread !== '' ? (isSpread ? spreadToRight : fadeToLeft) : ''};
  animation-duration: 0.3s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
`;

export const divider = css`
  width: 100%;
  border-bottom: 1px solid ${NeutralColors.gray40};
`;

export const globalNav = css`
  height: 40px;
  width: 40px;
  text-align: center;
  line-height: 40px;
  cursor: pointer;
  font-size: ${FontSizes.size18};
  color: ${SharedColors.cyanBlue10};
  &:hover {
    background: ${NeutralColors.gray40};
  }
`;

export const content = css`
  height: 100%;
  overflow: hidden;
  z-index: 2;
  flex: 1;
`;
