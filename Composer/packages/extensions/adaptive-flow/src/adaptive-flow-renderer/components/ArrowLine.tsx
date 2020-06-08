// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

export interface ArrowLineProps {
  width: number;
  arrowsize: number;
  containerHeight?: number;
  color?: string;
}
export const ArrowLine: React.FC<ArrowLineProps> = ({ width, arrowsize, color }) => {
  const points = [
    { x: 0, y: 0 },
    { x: width / 2 - (arrowsize + 2), y: 0 },
    { x: width / 2, y: arrowsize },
    { x: width / 2 + (arrowsize + 2), y: 0 },
    { x: width, y: 0 },
  ];
  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <svg css={{ display: 'block' }} height={1} overflow="visible" width={width}>
      <polyline fill="none" points={pointsString} stroke={color} strokeDasharray="none" strokeWidth="1" />
    </svg>
  );
};

ArrowLine.defaultProps = {
  width: 200,
  arrowsize: 8,
  containerHeight: 1,
  color: 'black',
};
