import { css } from '@emotion/core';
import { SharedColors, FontSizes } from '@uifabric/fluent-theme';

export const link = { display: 'block', textDecoration: 'none', color: '#4f4f4f' };

export const outer = css`
  display: flex;
  flex-direction: row;
  padding: 10px;
  width: 200px;
  box-sizing: border-box;
  &:hover {
    color: ${SharedColors.cyanBlue10};
  }
`;

export const icon = css`
  font-size: ${FontSizes.size18};
`;

export const label = isHide => css`
  font-size: ${FontSizes.size14};
  line-height: 20px;
  margin-left: 10px;
  visibility: ${isHide ? 'hidden' : 'visible'};
`;
