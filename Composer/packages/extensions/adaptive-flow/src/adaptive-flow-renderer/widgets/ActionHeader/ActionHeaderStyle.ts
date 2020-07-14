// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { ColorlessFontCSS, TruncatedCSS } from '@bfc/ui-shared';

import { StandardNodeWidth, HeaderHeight } from '../../constants/ElementSizes';
import { DisabledContainer, DisabledText } from '../styles/DisabledStyle';

const container = css`
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  width: ${StandardNodeWidth}px;
  height: ${HeaderHeight}px;
`;

export const HeaderContainerCSS = (backgroundColor = 'transparent') => css`
  ${container};
  background-color: ${backgroundColor};
`;

export const DisabledHeaderContainerCSS = css`
  ${container};
  ${DisabledContainer};
  ${DisabledText}
`;

export const HeaderBodyCSS = css`
  width: calc(100% - 40px);
  padding: 4px 8px;
  display: flex;
`;

const headerText = css`
  ${ColorlessFontCSS};
  ${TruncatedCSS};
  line-height: 16px;
  transform: translateY(-1px);
`;

export const HeaderTextCSS = (textColor = 'black') => css`
  ${headerText};
  color: ${textColor};
`;

export const DisabledHeaderTextCSS = css`
  ${headerText};
  ${DisabledText};
`;
