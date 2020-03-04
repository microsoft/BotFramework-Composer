// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { ObiColors } from '../../constants/ElementColors';

import { DivProps } from './styledComponents.types';
import { StandardFontCSS } from './sharedCSS';

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

export const BorderedDiv = styled.div<DivProps>(props => ({
  color: props.color || ObiColors.Black,
  width: props.width,
  height: props.height,
  padding: '2px 0 0 8px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  fontFamily: 'Segoe UI',
  fontSize: '12px',
  lineHeight: '14px',
  border: '1px solid #C4C4C4',
  boxSizing: 'border-box',
}));

export const SingleLineDiv = styled.div<DivProps>(props => ({
  width: props.width || 150,
  height: props.height || '19px',
  color: props.color || ObiColors.Black,
  fontSize: '12px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  lineHeight: '19px',
  fontFamily: 'Segoe UI',
}));

export const TextDiv = styled.div`
  ${StandardFontCSS};
  white-space: initial;
  overflow-wrap: break-word;
  word-break: break-all;
  display: inline-block;
`;
