import { css } from '@emotion/core';

export const header = css`
  width: 70vw;
  -webkit-box-flex: 1;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  background: #0078d4;
  color: #fff;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: 28px;
  font-weight: 100;
  font-weight: 600;
  padding: 0 28px;
  min-height: 40px;
  min-width: 300px;
`;

export const body = css`
  -webkit-box-flex: 4;
  -ms-flex: 4 4 auto;
  flex: 4 4 auto;
  padding: 5px 28px;
  overflow-y: hidden;
`;
