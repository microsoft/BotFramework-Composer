// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';

/**
 * Well known style names for the AlertDialog and ConfirmDialog.
 */
export const dialogStyle = {
  normal: 'NORMAL',
  console: 'CONSOLE',
};

export const NORMAL_STYLE = css`
  padding: 15px;
  margin-bottom: 20px;
  white-space: pre-line;
`;

export const CONSOLE_STYLE = css`
  background: #000;
  max-height: 90px;
  overflow-y: auto;
  font-size: 16px;
  line-height: 23px;
  color: #fff;
  padding: 10px 15px;
  margin-bottom: 20px;
  white-space: pre-line;
`;
