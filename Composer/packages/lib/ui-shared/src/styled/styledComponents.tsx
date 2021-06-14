// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { VisualEditorColors as Colors } from '../constants/VisualEditorColors';

import { DivProps } from './styledComponents.types';
import { StandardFontCSS, TruncatedCSS, MultilineCSS } from './sharedCSS';

const dynamicStyle = (props) =>
  css`
    color: ${props.color || Colors.Black};
  `;

export const LinkBtn = styled<any>(Link)((props) => ({
  color: props.color || Colors.AzureBlue,
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
  (props) => ({
    color: props.color || Colors.Black,
    width: props.width,
    height: props.height,
  })
);

export const SingleLineDiv = styled.div<DivProps>`
  ${StandardFontCSS};
  ${TruncatedCSS};
  line-height: ${(height) => (height ? height + 'px' : undefined)};
`;

export const TextDiv = styled.div`
  ${StandardFontCSS};
  ${MultilineCSS};
  white-space: pre-wrap;
  line-height: 16px;
  min-height: 16px;
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
export const MultilineTextWithEllipsis = styled.div`
  ${StandardFontCSS};
  white-space: pre;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FixedInfo = styled.span`
  ${StandardFontCSS};
  color: #757575;
`;
