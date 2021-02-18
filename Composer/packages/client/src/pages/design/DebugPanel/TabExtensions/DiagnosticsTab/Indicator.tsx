// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

export interface IndicatorProps {
  size: number;
  color: string;
}

export const Indicator: React.FC<IndicatorProps> = ({ size, color }) => {
  return (
    <svg fill={color} height={size} viewBox="0 0 100 100" width={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" />
    </svg>
  );
};
