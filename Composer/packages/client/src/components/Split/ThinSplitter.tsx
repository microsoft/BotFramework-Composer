// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import styled from '@emotion/styled';

import { RenderSplitterProps } from './RenderSplitterProps';

type Props = RenderSplitterProps & {
  color: string;
  hoverColor: string;
};

const HitArea = styled.div(({ horizontal, hoverColor }: { horizontal: boolean; hoverColor: string }) => ({
  boxSizing: 'border-box',
  outline: 'none',
  overflow: 'hidden',
  height: '100%',
  width: '100%',
  cursor: horizontal ? 'row-resize' : 'col-resize',
  background: 'transparent',
  '%:hover .thin-split-visual': {
    background: `${hoverColor}`,
  },
  userSelect: 'none',
}));

const getCenteredMargin = (size: number) => `${Math.max(0, Math.floor(size / 2) - 1)}px`;

const Splitter = styled.div(
  ({ horizontal, splitterSize, color }: { horizontal: boolean; splitterSize: number; color: string }) => ({
    boxSizing: 'border-box',
    outline: 'none',
    overflow: 'hidden',
    height: horizontal ? '1px' : '100%',
    width: horizontal ? '100%' : '1px',
    marginLeft: horizontal ? '0' : getCenteredMargin(splitterSize),
    marginTop: horizontal ? getCenteredMargin(splitterSize) : '0',
    background: `${color}`,
  })
);

/**
 * The default splitter which provides a thin line within a possibly larger mouse hit area.
 * @param props
 */
export const ThinSplitter = (props: Props) => {
  const { horizontal, pixelSize, color, hoverColor } = props;

  return (
    <HitArea horizontal={horizontal} hoverColor={hoverColor}>
      <Splitter className="thin-split-visual" color={color} horizontal={horizontal} splitterSize={pixelSize} />
    </HitArea>
  );
};

export const renderThinSplitter = (props: RenderSplitterProps) => {
  return (
    <ThinSplitter
      {...props}
      color={props.dragging ? 'black' : 'silver'}
      hoverColor={props.dragging ? 'black' : 'gray'}
    />
  );
};
