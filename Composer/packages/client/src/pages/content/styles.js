import { css } from '@emotion/core';

export const fileList = css`
  flex: 1;
`;

export const contentEditor = css`
  margin-left: 20px;
  height: 100%;
`;

export const title = css`
  color: #5f5f5f;
  font-size: 20px;
  line-height: 40px;
  padding-left: 15px;
`;

export const navLinkClass = {
  default: {
    display: 'block',
    textDecoration: 'none',
    color: '#5f5f5f',
    fontSize: '13px',
    fontWeight: 'bold',
    lineHeight: '30px',
    paddingLeft: '15px',
  },
  activestyle: {
    color: '#0083cb',
  },
};

export const label = css`
  text-decoration: none;
  color: rgb(95, 95, 95);
  font-size: 13px;
  font-weight: bold;
  line-height: 30px;
  padding-left: 15px;
`;

export const actionButton = css`
  font-size: 16px;
  margin-left: 15px;
`;

export const flexContentSpaceBetween = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const flexContent = css`
  display: flex;
  align-items: center;
`;

export const buttonGroups = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  & > button {
    background: #fff;
    margin-left: 0px;
    font-size: 16px;
    height: 40px;
  }
`;

// TODO: find out why background is grey, should not overwrite
export const CommandBarStyle = css`
  font-size: 16px;
  height: 40px;
  div {
    background-color: transparent;
  }
  button {
    background-color: transparent;
    font-size: 16px;
    height: 40px;
  }
  margin-left: -16px;
`;
