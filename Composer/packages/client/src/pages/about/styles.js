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
  height: 36px;
  margin: 33px 0px 0px 42px;
  font-size: 36px;
  line-height: 32px;
`;

export const body = css`
  width: auto;
  margin-top: 26px;
  margin-left: 60px;
`;

export const version = css`
  font-size: 24px;
  line-height: 32px;
`;

export const description = css`
  font-size: 24px;
  line-height: 32px;
  width: 50%;
  margin-top: 20px;
`;

export const DiagnosticsText = css`
  width: 50%;
  font-size: 24px;
  margin-top: 20px;
`;

export const smallText = css`
  margin-top: 20px;
  font-size: 13px;
`;
export const DiagnosticsInfoText = css`
  display: flex;
  justify-content: space-between;
  width: 460px;
  font-size: 24px;
`;

export const DiagnosticsInfoTextAlignLeft = css`
  width: 50%;
  text-align: left;
`;

export const DiagnosticsInfo = css`
  margin-top: 40px;
`;

export const linkContainer = css`
  height: 126px;
  display: flex;
  flex-direction: column;
  margin-left: 35px;
`;

export const linkTitle = css`
  font-size: 24px;
`;

export const linkRow = css`
  margin-top: 24px;
  display: flex;
  width: 400px;
`;

export const link = css`
  font-size: 24px;
  color: #0078d4;
  margin-left: 10px;
`;
export const icon = {
  icon: {
    color: '#0078d4',
    fontSize: '20px',
  },
};
