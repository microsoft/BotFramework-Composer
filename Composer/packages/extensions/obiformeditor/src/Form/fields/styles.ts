import { css } from '@emotion/core';

export const arrayItem = css`
  display: flex;
  align-items: center;
  padding-left: 10px;

  & + & {
    margin-top: 10px;
  }
`;

export const arrayItemValue = css`
  flex: 1;
`;

export const arrayItemDefault = css`
  font-size: 14px;
`;

export const field = css`
  margin: 10px 0;
`;
