// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';

export interface IndicatorProps {
  color: string;
}

export const Indicator: React.FC<IndicatorProps> = ({ color }) => {
  return (
    <div
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
