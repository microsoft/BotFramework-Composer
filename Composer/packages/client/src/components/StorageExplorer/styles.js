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

export const sampleList = css`
  width: calc(100% - 30px);
  height: calc(100vh - 150px);
  margin: 30px 0 0 30px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-content: baseline;
`;

export const sampleItem = css`
  margin-right: 35px;
  margin-bottom: 20px;
  width: 120px;
  height: 160px;
  cursor: pointer;
  border: 1px solid #aaa;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

export const newTip = css`
  padding-left: 30px;
  font-size: 14px;
  line-height: 30px;
  font-weight: bold;
`;
