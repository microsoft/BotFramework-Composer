// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
// import React from 'react';
import { jsx, css } from '@emotion/core';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension-client';

const containerStyle = (theme?: string) => css`
  padding: 8px 8px;
  margin: -8px -8px;
  background-color: ${theme ? theme : 'inherit'};
`;

const textStyles = (color?: string) => css`
  color: ${color ? color : 'inherit'};
  max-height: 48px;
  overflow: hidden;
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

  return (
    <div css={containerStyle(colors?.theme)}>
      <div css={textStyles(colors?.color)}>{body || ' '}</div>
    </div>
  );
};
