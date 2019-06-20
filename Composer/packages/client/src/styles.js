import { css } from '@emotion/core';
import { NeutralColors, Depths, SharedColors, FontSizes } from '@uifabric/fluent-theme';

export const main = css`
  height: calc(100vh - 105px);
  display: flex;
`;

export const sideBar = isExpand => css`
  width: ${isExpand ? '200' : '40'}px;
  background-color: ${NeutralColors.gray20};
  height: 100%;
  box-shadow: ${Depths.depth8};
  transition: width 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const divider = isExpand => css`
  width: ${isExpand ? '85%' : '40%'};
  border-bottom: 1px solid ${NeutralColors.gray40};
  margin: 0 auto;
`;

export const globalNav = css`
  height: 40px;
  width: 40px;
  text-align: center;
  line-height: 40px;
  cursor: pointer;
  font-size: ${FontSizes.size16};
  color: ${SharedColors.cyanBlue10};
  &:hover {
    background: ${NeutralColors.gray40};
  }
`;

export const content = css`
  outline: none;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const showDesign = show => css`
  display: ${show ? 'block' : 'none'} !important;
`;

export const leftNavBottom = () => css`
  height: 90px;
`;

export const rightPanel = () => css`
  display: flex-column;
  width: 100%;
`;
