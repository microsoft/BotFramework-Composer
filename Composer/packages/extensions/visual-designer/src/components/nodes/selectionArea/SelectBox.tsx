/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC } from 'react';

interface NodeProps {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
}
export const SelectBox: FC<NodeProps> = ({ xStart, xEnd, yStart, yEnd }) => {
  if (xEnd === 0 || yEnd === 0) {
    return null;
  }

  return (
    <div
      css={{
        height: Math.abs(yEnd - yStart),
        marginLeft: Math.min(xStart, xEnd),
        marginTop: Math.min(yStart, yEnd),
        width: Math.abs(xEnd - xStart),
      }}
    />
  );
};
