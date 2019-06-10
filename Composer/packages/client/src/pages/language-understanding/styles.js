import { css } from '@emotion/core';

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

export const ContentHeaderStyle = css`
  padding-left: 20px;
  padding-right: 20px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ContentStyle = css`
  margin-left: 2px;
  display: flex;
  border-top: 1px solid #dddddd;
  flex: 1;
  position: relative;
  nav {
    width: 200px;
    ul {
      margin-top: 0px;
    }
  }
`;

export const contentEditor = css`
  flex: 4;
  margin: 20px;
  height: calc(100vh - 200px);
  position: relative;
  overflow: auto;
`;

export const codeEditorContainer = css`
  width: 100%;
`;

export const codeEditor = css`
  border: 1px solid #dddddd;
  padding-bottom: 10px;
  height: calc(100% - 20px);
`;

export const formCell = css`
  white-space: pre-wrap;
  font-size: 14px;
  textarea,
  input {
    border: 1px solid #dddddd;
  }
`;

// styles override, should use '@uifabric/fluent-theme' later
export const whiteButton = css`
  background: transparent;
  button {
    background: transparent;
    &:hover {
      background: rgb(234, 234, 234);
    }
  }
`;

export const navLinkText = css`
  width: 140px;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: left;
`;

export const navLinkBtns = css``;
