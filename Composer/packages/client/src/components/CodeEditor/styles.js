import { css } from '@emotion/core';
export const actionButton = css`
  font-size: 16px;
  margin-left: 15px;
`;

export const flexContentSpaceBetween = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const flexContent = css`
  display: flex;
  align-items: center;
`;

export const buttonGroups = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  & > button {
    background: #fff;
    margin-left: 0px;
    font-size: 16px;
    height: 40px;
  }
`;
