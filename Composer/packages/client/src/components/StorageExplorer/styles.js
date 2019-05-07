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
  cursor: pointer;
  margin-right: 35px;
  margin-bottom: 20px;
`;

export const sampleItemImage = css`
  width: 120px;
  height: 160px;
  cursor: pointer;
  background: #eee;
  box-shadow: 3px 3px 2px #aaa;
  & : hover {
    box-shadow: 5px 5px 2px #aaa;
  }
`;

export const sampleItemName = css`
  width: 120px;
  margin-top: 5px;
  font-size: 14px;
  text-alain: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const newTip = css`
  padding-left: 30px;
  font-size: 14px;
  line-height: 30px;
  font-weight: bold;
`;
