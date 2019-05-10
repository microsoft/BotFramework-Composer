import { css } from '@emotion/core';

export const contentContainer = css`
  display: flex;
  height: calc(99vh - 50px);
`;

export const fileList = css`
  flex: 1;
  margin-left: 30px;
  margin-top: 20px;
`;

export const contentEditor = css`
  flex: 4;
  margin-top: 20px;
  margin-left: 20px;
  height: calc(100% - 20px);
`;

export const title = css`
  font-weight: bold;
  color: #5f5f5f;
  font-size: 20px;
  line-height: 40px;
  padding-left: 15px;
`;
