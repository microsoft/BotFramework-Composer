import { css } from '@emotion/core';

export const header = css`
  position: relative;
  background: #fff;
  font-size: 18px;
  color: #fff;
  height: 40px;
  display: flex;
  box-shadow: 0 2px rgba(0, 0, 0, 0.1);
`;

export const actionButton = css`
  font-size: 14px;
  margin-left: 10px;
  line-height: 40px;
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
