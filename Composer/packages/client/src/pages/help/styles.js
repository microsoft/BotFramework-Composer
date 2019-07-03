import { css } from '@emotion/core';

export const outline = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 32px 50px 32px 32px;
  border: 1px solid #979797;
  overflow-x: auto;
`;

export const content = css`
  min-width: 1300px;
  height: 100%;
`;

export const title = css`
  display: block;
  height: 36px;
  margin: 33px 0px 0px 42px;
  font-size: 36px;
  line-height: 32px;
`;

export const introduction = css`
  width: auto;
  height: 45%;
  margin-top: 26px;
  margin-left: 42px;
  overflow-y: auto;
`;

export const introText = css`
  width: 50%;
  height: 100%;
  font-size: 24px;
`;

export const introTitleLeft = css`
  display: block;
  height: 37px;
  width: 60%;
  font-size: 24px;
  line-height: 32px;
`;

export const introTitleRight = css`
  display: block;
  height: 37px;
  width: 40%;
  font-size: 24px;
  line-height: 32px;
`;

export const introLink = css`
  display: block;
  height: 79px;
  width: 100%;
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

export const telephone = css`
  margin-top: 40px;
  margin-left: 42px;
  font-size: 24px;
`;
