// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
export const actionButton = css`
  font-size: 16px;
  margin: 0;
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
  padding: 5px 20px;
  height: 60px;
  display: flex;
  flex-shrink: 0;
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
  overflow: visible;
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
`;

export const consoleStyle = css`
  background: #000;
  color: #fff;
  padding: 15px;
  margin-bottom: 20px;
`;

export const dialogItem = selected => css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${selected ? NeutralColors.gray20 : NeutralColors.white};
  font-weight: ${selected ? FontWeights.semibold : FontWeights.semilight};
  height: 32px;
  font-size: ${FontSizes.small};
  padding-left: 18px;
  cursor: pointer;
`;
