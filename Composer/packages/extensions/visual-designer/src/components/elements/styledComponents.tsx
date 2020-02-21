// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { ObiColors } from '../../constants/ElementColors';

import { UIElement, ElementProps, MultiLineDivProps, UI_ELEMENT_KEY } from './styledComponents.types';

const dynamicStyle = props =>
  css`
    color: ${props.color || ObiColors.Black};
  `;

export const parseElementSchema = (element: UIElement) => {
  const { [UI_ELEMENT_KEY]: ElementComponent, ...props } = element;
  return {
    ElementComponent,
    props,
  };
};

export const LinkBtn = styled(Link)`
  ${dynamicStyle}
`;

export const Span = styled.span`
  ${dynamicStyle}
`;

export const BorderedDiv = styled.div<ElementProps>(props => ({
  color: props.color || ObiColors.Black,
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

export const MultiLineDiv = styled.div<MultiLineDivProps>(props => ({
  color: props.color || ObiColors.Black,
  fontSize: '12px',
  lineHeight: '19px',
  fontFamily: 'Segoe UI',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  '-webkit-line-clamp': props.lineNum || 1,
  '-webkit-box-orient': 'vertical',
}));
