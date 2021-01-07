// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import styled from '@emotion/styled';
import { RenderSplitterProps } from '@geoffcox/react-splitter';

const splitVisualClassName = 'thin-split-visual';

const HitArea = styled.div(({ horizontal, dragging }: { horizontal: boolean; dragging: boolean }) => ({
  boxSizing: 'border-box',
  outline: 'none',
  overflow: 'hidden',
  height: '100%',
  width: '100%',
  cursor: horizontal ? 'row-resize' : 'col-resize',
  background: 'transparent',
  [`&:hover .${splitVisualClassName}`]: {
    background: dragging ? 'black' : 'gray',
  },
  userSelect: 'none',
}));

const getCenteredMargin = (size: number) => `${Math.max(0, Math.floor(size / 2) - 1)}px`;

const Splitter = styled.div(
  ({ horizontal, splitterSize, dragging }: { horizontal: boolean; splitterSize: number; dragging: boolean }) => ({
    boxSizing: 'border-box',
    outline: 'none',
    overflow: 'hidden',
    height: horizontal ? '1px' : '100%',
    width: horizontal ? '100%' : '1px',
    marginLeft: horizontal ? '0' : getCenteredMargin(splitterSize),
    marginTop: horizontal ? getCenteredMargin(splitterSize) : '0',
    background: dragging ? 'black' : 'silver',
  })
);

/**
 * The default splitter which provides a thin line within a possibly larger mouse hit area.
 * @param props
 */
export const ThinSplitter = (props: RenderSplitterProps) => {
  const { horizontal, pixelSize, dragging } = props;

  return (
    <HitArea dragging={dragging} horizontal={horizontal}>
      <Splitter className={splitVisualClassName} dragging={dragging} horizontal={horizontal} splitterSize={pixelSize} />
    </HitArea>
  );
};

export const renderThinSplitter = (props: RenderSplitterProps) => {
  return <ThinSplitter {...props} />;
};
