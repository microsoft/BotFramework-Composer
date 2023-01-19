// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { FluentTheme } from '@fluentui/theme';
import { Text } from '@fluentui/react/lib/Text';

interface SectionTitleProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ level, ...props }) => (
  <Text
    aria-level={level}
    css={css`
      font-size: ${FluentTheme.fonts.xLarge.fontSize};
      margin: 8px 0;
    `}
    role="heading"
    {...props}
  />
);

SectionTitle.displayName = 'SectionTitle';
