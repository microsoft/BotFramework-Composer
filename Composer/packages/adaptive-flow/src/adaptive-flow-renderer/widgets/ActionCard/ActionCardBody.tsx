// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
// import React from 'react';
import { jsx, css } from '@emotion/core';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension-client';

const containerStyle = (theme?: string, color?: string) => css`
  padding: 7px 8px;
  background-color: ${theme ? theme : 'inherit'};
  color: ${color ? color : 'inherit'};
`;

interface ActionCardBodyProps extends WidgetContainerProps {
  body?: string;
  colors?: {
    theme?: string;
    color?: string;
  };
}

export const ActionCardBody: WidgetComponent<ActionCardBodyProps> = (props) => {
  const { body, colors } = props;

  return <div css={containerStyle(colors?.theme, colors?.color)}>{body}</div>;
};
