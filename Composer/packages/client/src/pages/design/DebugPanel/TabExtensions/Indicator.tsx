// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import React from 'react';

export interface IndicatorProps {
  color: string;
}

export const Indicator: React.FC<IndicatorProps> = ({ color }) => {
  return (
    <div
      aria-label={formatMessage('Unread notifications Indicator')}
      css={css`
        background: ${color};
        width: 10px;
        height: 10px;
        border-radius: 50%;
      `}
      data-testid="DebugErrorIndicator"
    />
  );
};
