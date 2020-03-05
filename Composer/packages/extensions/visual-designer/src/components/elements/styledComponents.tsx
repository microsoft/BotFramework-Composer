// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { ObiColors } from '../../constants/ElementColors';

import { DivProps } from './styledComponents.types';
import { StandardFontCSS, TruncatedCSS, MultilineCSS } from './sharedCSS';

const dynamicStyle = props =>
  css`
    color: ${props.color || ObiColors.Black};
  `;

export const LinkBtn = styled(Link)(props => ({
  color: props.color || ObiColors.AzureBlue,
}));

export const Span = styled.span`
  ${dynamicStyle}
`;

export const BorderedDiv = styled.div<DivProps>(
  css`
    ${StandardFontCSS};
    ${TruncatedCSS};
    padding: 2px 0 0 8px;
    border: 1px solid #c4c4c4;
    box-sizing: border-box;
  `,
  props => ({
    color: props.color || ObiColors.Black,
    width: props.width,
    height: props.height,
  })
);

export const SingleLineDiv = styled.div<DivProps>`
  ${StandardFontCSS};
  ${TruncatedCSS};
  line-height: ${height => (height ? height + 'px' : undefined)};
`;

export const TextDiv = styled.div`
  ${StandardFontCSS};
  ${MultilineCSS};
  line-height: 16px;
  display: inline-block;
`;

export const Text = styled.span(
  css`
    ${StandardFontCSS};
  `,
  ({ color }) =>
    css`
      color: ${color};
    `
);

export const FixedInfo = styled.span`
  ${StandardFontCSS};
  color: #757575;
`;
