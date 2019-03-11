import { css } from '@emotion/core';

export const container = variant => css`
  width: 325px;
  background-color: #ffffff;
  height: ${variant && variant === 'large' ? '500px' : '350px'};
  overflow: auto;
`;

export const top = css`
  width: 100%;
  height: 10px;
  background-color: #e4efff;
`;
