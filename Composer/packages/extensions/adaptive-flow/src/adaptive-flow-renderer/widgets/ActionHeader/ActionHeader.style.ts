// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { ColorlessFontCSS, TruncatedCSS } from '@bfc/ui-shared';

import { StandardNodeWidth, HeaderHeight } from '../../constants/ElementSizes';

const container = css`
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
`;

export const HeaderContainerCSS = (backgroundColor = 'transparent') => css`
  ${container};
  width: ${StandardNodeWidth}px;
  height: ${HeaderHeight}px;
  background-color: ${backgroundColor};
`;

export const HeaderBodyCSS = css`
  width: calc(100% - 40px);
  padding: 4px 8px;
  display: flex;
`;

const headerText = css`
  ${ColorlessFontCSS};
  ${TruncatedCSS};
`;

export const HeaderTextCSS = (textColor = 'black') => css`
  ${headerText};
  line-height: 16px;
  transform: translateY(-1px);
  color: ${textColor};
`;
