import { css } from '@emotion/core';

export const panelStyle = {
  main: { width: '1000px' },
  overlay: { width: '100vw' },
};

export const body = css`
  display: flex;
  -webkit-box-flex: 4;
  -ms-flex: 4 4 auto;
  flex: 4 4 auto;
  overflow: hidden;
  position: absolute;
  height: 100vh;
  left: 0;
`;

export const content = css`
  display: flex;
  flex-direction: column;
`;

export const panelContent = css`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-grow: 1;
`;

export const title = css`
  padding: 37px 30px 2px 30px;
  font-size: 34px;
  color: #2b579a !important;
  font-weight: lighter;
`;
