// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { ObiColors } from '../../constants/ElementColors';

import { DivProps } from './styledComponents.types';
import { StandardFontCSS, EllipsisCSS } from './sharedCSS';

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
    ${EllipsisCSS};
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
  ${EllipsisCSS};
`;

export const TextDiv = styled.div`
  ${StandardFontCSS};
  white-space: initial;
  overflow-wrap: break-word;
  word-break: break-all;
  display: inline-block;
`;
