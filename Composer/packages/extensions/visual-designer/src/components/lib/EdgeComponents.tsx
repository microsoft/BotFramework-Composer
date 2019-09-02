/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';

const BAR_SIZE = 3;
const TEXT_PADDING = 8;
const FONT_SIZE = 14;
const DEFAULT_EDGE_COLOR = '#979797';
export const HorizontalEdge = ({ length, color, text, x, y, dashed, directed }): JSX.Element => {
  const strokeProps = {
    strokeDasharray: dashed ? '4' : 'none',
    strokeWidth: '1',
    stroke: color,
  };

  return (
    <svg
      css={{
        position: 'absolute',
        overflow: 'visible',
        left: x,
        top: y,
        width: length,
        height: BAR_SIZE,
        transitionDuration: '50ms',
        transitionProperty: 'left, right, top, bottom, length',
        zIndex: 0,
      }}
      data-testid="HorizontalEdge"
    >
      {text ? (
        <text x={TEXT_PADDING} y={-5} fontSize={FONT_SIZE}>
          {text}
        </text>
      ) : null}
      <line x1="0" y1="0" x2={length} y2="0" {...strokeProps} />
      {directed ? (
        <Fragment>
          <line x1={length - 5} y1="5" x2={length} y2="0" {...strokeProps} />
          <line x1={length - 5} y1="-5" x2={length} y2="0" {...strokeProps} />
        </Fragment>
      ) : null}
    </svg>
  );
};

export const VerticalEdge = ({ length, color, text, x, y, dashed, directed }): JSX.Element => {
  const strokeProps = {
    strokeDasharray: dashed ? '4' : 'none',
    strokeWidth: '1',
    stroke: color,
  };

  return (
    <svg
      css={{
        position: 'absolute',
        overflow: 'visible',
        left: x,
        top: y,
        width: BAR_SIZE,
        height: length,
        transitionDuration: '50ms',
        transitionProperty: 'left, right, top, bottom, length',
        zIndex: 0,
      }}
      data-testid="VerticalEdge"
    >
      {text ? (
        <text x={TEXT_PADDING} y={FONT_SIZE + TEXT_PADDING} fontSize={FONT_SIZE}>
          {text}
        </text>
      ) : null}
      <line x1="0" y1="0" x2="0" y2={length} {...strokeProps} />
      {directed ? (
        <Fragment>
          <line x1={-5} y1={length - 5} x2={0} y2={length} {...strokeProps} />
          <line x1={5} y1={length - 5} x2={0} y2={length} {...strokeProps} />
        </Fragment>
      ) : null}
    </svg>
  );
};

export const Edge = ({
  direction,
  x,
  y,
  length,
  color = DEFAULT_EDGE_COLOR,
  text = '',
  dashed = false,
  directed = false,
}): JSX.Element =>
  direction === 'x' ? (
    <HorizontalEdge x={x} y={y} length={length} color={color} text={text} dashed={dashed} directed={directed} />
  ) : (
    <VerticalEdge x={x} y={y} length={length} color={color} text={text} dashed={dashed} directed={directed} />
  );
