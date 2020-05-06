// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';

export const StandardFontCSS = css`
  font-size: 12px;
  line-height: 14px;
  font-family: Segoe UI;
  color: black;
`;

export const TruncatedCSS = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MultilineCSS = css`
  white-space: initial;
  overflow-wrap: anywhere;
  word-break: normal;
`;

export const ColorlessFontCSS = css`
  font-size: 12px;
  line-height: 14px;
  font-family: Segoe UI;
`;
