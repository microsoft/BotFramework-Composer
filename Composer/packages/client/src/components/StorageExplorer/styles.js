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

export const panelContent = css`
  width: 825px;
  height: 100vh;
  display: flex;
  flex-direction: row;
`;
