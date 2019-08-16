/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC } from 'react';

interface NodeProps {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
  styles?: object;
}
export const SelectBox: FC<NodeProps> = ({ xStart, xEnd, yStart, yEnd, styles = {} }) => {
  if (xEnd === 0 || yEnd === 0) {
    return null;
  }

  const css = {
    height: Math.abs(yEnd - yStart),
    left: Math.min(xStart, xEnd),
    top: Math.min(yStart, yEnd),
    width: Math.abs(xEnd - xStart),
    backgroundColor: '#e4effe',
    border: '1px dotted #001f52',
    opacity: 0.5,
    position: 'absolute' as 'absolute',
    zIndex: 10,
    ...styles,
  };
  return <div css={css} />;
};
