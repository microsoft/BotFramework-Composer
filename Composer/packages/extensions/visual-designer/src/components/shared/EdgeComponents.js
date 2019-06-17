import React from 'react';

const BAR_SIZE = 3;
const TEXT_PADDING = 8;
const FONT_SIZE = 14;

export const HorizontalEdge = ({ length, text, x, y }) => (
  <svg
    style={{
      position: 'absolute',
      overflow: 'visible',
      left: x,
      top: y,
      width: length,
      height: BAR_SIZE,
      transitionDuration: '50ms',
      transitionProperty: 'left, right, top, bottom, length',
      zIndex: '-1',
    }}
  >
    {text ? (
      <text x={TEXT_PADDING} y={-5} fontSize={FONT_SIZE}>
        {text}
      </text>
    ) : null}
    <line x1="0" y1="0" x2={length} y2="0" stroke="#979797" strokeWidth="1" />
  </svg>
);

export const VerticalEdge = ({ length, text, x, y }) => (
  <svg
    style={{
      position: 'absolute',
      overflow: 'visible',
      left: x,
      top: y,
      width: '1px',
      height: length,
      transitionDuration: '50ms',
      transitionProperty: 'left, right, top, bottom, length',
      zIndex: '-1',
    }}
  >
    {text ? (
      <text x={TEXT_PADDING} y={FONT_SIZE + TEXT_PADDING} fontSize={FONT_SIZE}>
        {text}
      </text>
    ) : null}
    <line x1="0" y1="0" x2="0" y2={length} stroke="#979797" strokeWidth="1" />
  </svg>
);

export const Edge = ({ direction, x, y, length, text }) =>
  direction === 'x' ? (
    <HorizontalEdge x={x} y={y} length={length} text={text} />
  ) : (
    <VerticalEdge x={x} y={y} length={length} text={text} />
  );
