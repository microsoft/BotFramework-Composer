import { css } from '@emotion/core';

export const header = css`
  position: relative;
  line-height: 50px;
  background: #001f52;
  font-size: 20px;
  color: #fff;
  height: 50px;
  display: flex;
`;

export const waffle = css`
  margin-left: 15px;
`;

export const aside = css`
  width: 200;
  margin-left: 20px;
`;

export const bot = css`
  color: #eaeaea;
  width: 450px;
  position: absolute;
  right: 0;
`;

export const botButton = css`
  color: white;
  margin-top: 8px;
  margin-right: 35px;
  float: right;
`;

export const botMessage = css`
  margin-left: 5px;
  font-size: 18px;
`;

export const actionButton = css`
  color: #eaeaea;
  font-size: 16px;
  margin-top: 2px;
  margin-left: 15px;
`;

export const fileInput = css`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;
