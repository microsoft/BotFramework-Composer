// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { WidgetContainerProps, WidgetComponent, useShellApi } from '@bfc/extension-client';

import { CardComment } from './CardComment';

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
  hideComment?: boolean;
}

export const ActionCardBody: WidgetComponent<ActionCardBodyProps> = ({ body, colors, truncate, hideComment, data }) => {
  const { flowCommentsVisible } = useShellApi();
  const comment = data.$designer?.comment;

  return (
    <div css={containerStyle(colors?.theme)}>
      {!hideComment && flowCommentsVisible && comment && <CardComment comment={comment} />}
      <div css={textStyles(colors?.color, truncate)}>{body || ' '}</div>
    </div>
  );
};
