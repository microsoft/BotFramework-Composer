// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights, FontSizes, mergeStyles } from 'office-ui-fabric-react/lib/Styling';

export const actionButton = css`
  font-size: 16px;
  margin: 0;
  margin-left: 15px;
`;

export const iconClass = mergeStyles({
  fontSize: FontSizes.medium,
});

export const flexContentSpaceBetween = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const codeEditorContainer = css`
  width: 100%;
`;

export const formCell = css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 28px;
`;

export const luPhraseCell = css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
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

export const tableCell = css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
`;

export const content = css`
  outline: none;
`;
