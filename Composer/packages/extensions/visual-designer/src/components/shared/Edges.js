import React from 'react';

export const HorizontalEdge = ({ length, text, x, y }) => (
  <svg style={{ position: 'absolute', left: x, top: y, width: length }}>
    {text ? <text>{text}</text> : null}
    <line x1="0" y1="0" x2={length} y2="0" stroke="grey" strokeWidth="2" />
  </svg>
);

export const VerticalEdge = ({ length, text, x, y }) => (
  <svg style={{ position: 'absolute', left: x, top: y, height: length }}>
    {text ? <text>{text}</text> : null}
    <line x1="0" y1="0" x2="0" y2={length} stroke="grey" strokeWidth="2" />
  </svg>
);
