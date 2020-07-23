// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontWeights } from '@uifabric/styling';
export const content = css`
  min-height: 28px;
  outline: none;
`;

export const formCell = css`
  display: flex;
  flex-direction: column;
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 28px;
`;

export const textField = {
  root: {
    height: 28,
    marginLeft: -5,
  },
  field: {
    paddingLeft: 4,
    marginTop: -5,
  },
};

export const bold = css`
  font-weight: ${FontWeights.semibold};
`;

export const link = {
  root: {
    fontSize: 14,
    lineHeight: 28,
  },
};

export const actionButton = css`
  font-size: 16px;
  margin: 0;
  margin-left: 15px;
`;
