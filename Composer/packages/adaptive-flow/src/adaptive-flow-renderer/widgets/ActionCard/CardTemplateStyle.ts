// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';

import { HeaderHeight, StandardSectionHeight, StandardNodeWidth } from '../../constants/ElementSizes';
import { DisabledContainer } from '../styles/DisabledStyle';

const fullWidthSection = css`
  width: 100%;
  box-sizing: border-box;
`;

export const HeaderCSS = css`
  ${fullWidthSection};
  height: ${HeaderHeight}px;
`;

export const BodyCSS = css`
  ${fullWidthSection};
  min-height: ${StandardSectionHeight}px;
  padding: 8px 8px;
`;

export const FooterCSS = css`
  ${fullWidthSection};
  min-height: ${StandardSectionHeight}px;
  padding: 8px 8px;
`;

export const SeparateLineCSS = css`
  display: block;
  height: 0px;
  overflow: visible;
`;

const containerCSS = css`
  font-size: 12px;
  cursor: pointer;
  overflow: hidden;
  border-radius: 2px 2px 0 0;
  width: ${StandardNodeWidth}px;
  min-height: ${HeaderHeight}px;
`;

export const CardContainerCSS = css`
  ${containerCSS};
  background-color: white;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
`;

export const DisabledCardContainerCSS = css`
  ${CardContainerCSS};
  ${DisabledContainer};
`;
