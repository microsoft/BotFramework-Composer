import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';

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
    width: 255px;
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

export const luPhraseCell = css`
  white-space: pre-wrap;
  font-size: 14px;
  max-height: 200px;
  overflow: auto;
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
export const textFieldLabel = css`
  font-weight: ${FontWeights.semibold};
`;

export const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};

export const dialogModal = {
  main: {
    maxWidth: '450px !important',
  },
};

export const dialogSubTitle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
`;

export const dialogContent = css`
  margin-top: 20px;
  margin-bottom: 50px;
  width: 70%;
`;

export const consoleStyle = css`
  background: #000;
  color: #fff;
  padding: 15px;
  margin-bottom: 20px;
`;
