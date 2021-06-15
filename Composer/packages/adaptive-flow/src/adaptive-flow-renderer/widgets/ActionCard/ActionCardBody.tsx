// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
// import React from 'react';
import { jsx, css } from '@emotion/core';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension-client';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';

const containerStyle = (theme?: string) => css`
  padding: 8px 8px;
  margin: -8px -8px;
  background-color: ${theme ? theme : 'inherit'};
`;

const textStyles = (color?: string, truncate?: boolean) => css`
  color: ${color ? color : 'inherit'};
  overflow: hidden;

  // https://css-tricks.com/line-clampin/#weird-webkit-flexbox-way
  ${truncate
    ? `
max-height: 48px;
display: -webkit-box;
-webkit-line-clamp: 3;
-webkit-box-orient: vertical;
`
    : undefined}
`;

interface ActionCardBodyProps extends WidgetContainerProps {
  body?: string;
  colors?: {
    theme?: string;
    color?: string;
  };
  truncate?: boolean;
}

export const ActionCardBody: WidgetComponent<ActionCardBodyProps> = (props) => {
  const { body, colors, truncate, id } = props;

  if (truncate) {
    return (
      <TooltipHost calloutProps={{ directionalHint: DirectionalHint.rightCenter }} content={body} id={id} styles={{}}>
        <div css={containerStyle(colors?.theme)}>
          <div aria-describedby={id} css={textStyles(colors?.color, truncate)}>
            {body || ' '}
          </div>
        </div>
      </TooltipHost>
    );
  }

  return (
    <div css={containerStyle(colors?.theme)}>
      <div css={textStyles(colors?.color)}>{body || ' '}</div>
    </div>
  );
};
