import { css } from '@emotion/core';

export const outline = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 32px 50px 0px 32px;
  border: 1px solid #979797;
  overflow-x: auto;
`;

export const content = css`
  height: 100%;
`;

export const title = css`
  display: block;
  margin: 33px 0px 0px 42px;
  font-size: 36px;
  line-height: 32px;
`;

export const introduction = css`
  width: auto;
  margin-top: 26px;
  margin-left: 42px;
  overflow-y: auto;
`;

export const introText = css`
  width: 50%;
  height: 100%;
  font-size: 24px;
`;

export const linkContainer = css`
  height: 126px;
  display: flex;
  flex-direction: column;
  margin-top: 40px;
  margin-left: 42px;
`;

export const linkTitle = css`
  font-size: 24px;
`;

export const link = css`
  font-size: 24px;
  color: #0078d4;
  text-decoration: underline;
`;
