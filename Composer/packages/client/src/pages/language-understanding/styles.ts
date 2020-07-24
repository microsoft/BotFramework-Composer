// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontSizes, mergeStyles } from 'office-ui-fabric-react/lib/Styling';

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

export const diffEditorContainer = css`
  min-width: 400px;
  height: 100%;
  > div {
    width: calc(50% - 10px);
    height: 100%;
    float: left;
  }
`;

export const editorToolbar = css`
  height: 50px;
`;

export const diffEditorRight = css`
  margin-left: 20px;
`;

export const diffEditorContent = css`
  height: calc(100% - 50px);
`;

export const dropdown = {
  dropdown: { width: '50%', maxWidth: 300, minWidth: 100 },
};
