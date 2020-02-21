// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { ChoiceInputSize, ChoiceInputMarginTop } from '../../constants/ElementSizes';

export interface MultiLineDivProps {
  color?: string;
  lineNum?: number;
}

const dynamicStyle = props =>
  css`
    color: ${props.color};
  `;

export const LinkBtn = styled(Link)`
  ${dynamicStyle}
`;

export const Span = styled.span`
  ${dynamicStyle}
`;

export const BorderedDiv = styled.div(props => ({
  color: props.color,
  height: ChoiceInputSize.height,
  width: ChoiceInputSize.width,
  marginTop: ChoiceInputMarginTop,
  paddingLeft: '8px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  fontFamily: 'Segoe UI',
  fontSize: '12px',
  lineHeight: '14px',
  border: '1px solid #C4C4C4',
  boxSizing: 'border-box',
}));

export const MultiLineDiv = styled.div<MultiLineDivProps>(props => ({
  color: props.color,
  fontSize: '12px',
  lineHeight: '19px',
  fontFamily: 'Segoe UI',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  '-webkit-line-clamp': props.lineNum || 1,
  '-webkit-box-orient': 'vertical',
}));
