// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

interface Coord2D {
  x: number;
  y: number;
}

export enum EdgeDirection {
  Up = 'Up',
  Down = 'Down',
  Left = 'left',
  Right = 'Right',
}

interface EdgeOptions {
  color: string;

  /** Indicates if the line stroke is dashed */
  dashed?: boolean;

  /** If set to true, an arrow will be drawn at the end of the line */
  arrowed?: boolean;

  /** Text displayed on the edge */
  label?: string | number;

  /** label text's offset compared with start point's position */
  labelOptions?: {
    offset: {
      x: number;
      y: number;
    };
    fontSize: number;
  };
}

const defaultEdgeOptions: EdgeOptions = {
  color: '#979797',
  labelOptions: {
    offset: {
      x: 8,
      y: -5,
    },
    fontSize: 14,
  },
};

const calculateEdgeEndPoint = (startPoint: Coord2D, direction: EdgeDirection, length: number): Coord2D => {
  switch (direction) {
    case EdgeDirection.Up:
      return { x: startPoint.x, y: startPoint.y - length };
    case EdgeDirection.Down:
      return { x: startPoint.x, y: startPoint.y + length };
    case EdgeDirection.Left:
      return { x: startPoint.x - length, y: startPoint.y };
    case EdgeDirection.Right:
      return { x: startPoint.x + length, y: startPoint.y };
  }
};

const calculateArrowPoints = (endPoint: Coord2D, direction: EdgeDirection, arrowSize = 5): Coord2D[] => {
  switch (direction) {
    case EdgeDirection.Up:
      return [
        { x: endPoint.x - arrowSize, y: endPoint.y - arrowSize },
        { x: endPoint.x + arrowSize, y: endPoint.y - arrowSize },
      ];
    case EdgeDirection.Down:
      return [
        { x: endPoint.x - arrowSize, y: endPoint.y + arrowSize },
        { x: endPoint.x + arrowSize, y: endPoint.y + arrowSize },
      ];
    case EdgeDirection.Left:
      return [
        { x: endPoint.x + arrowSize, y: endPoint.y + arrowSize },
        { x: endPoint.x + arrowSize, y: endPoint.y - arrowSize },
      ];
    case EdgeDirection.Right:
      return [
        { x: endPoint.x - arrowSize, y: endPoint.y + arrowSize },
        { x: endPoint.x - arrowSize, y: endPoint.y - arrowSize },
      ];
  }
};

export const drawSVGEdge = (
  startPoint: Coord2D,
  direction: EdgeDirection,
  length: number,
  options?: EdgeOptions
): JSX.Element => {
  if (length <= 0) return <></>;

  const edgeOptions = options ? { ...defaultEdgeOptions, ...options } : defaultEdgeOptions;
  const { arrowed, color, dashed, label, labelOptions } = edgeOptions;
  const strokeProps = {
    strokeDasharray: dashed ? '4' : 'none',
    strokeWidth: '1',
    stroke: color,
  };
  const endPoint = calculateEdgeEndPoint(startPoint, direction, length);

  const elements: JSX.Element[] = [];
  // Draw the edge line
  if (length > 0) {
    const line = (
      <line key="edge__line" x1={startPoint.x} y1={startPoint.y} x2={endPoint.x} y2={endPoint.y} {...strokeProps} />
    );
    elements.push(line);
  }
  // Draw the edge label
  if (typeof label === 'string' || typeof label === 'number') {
    const text = (
      <text
        key="edge__text"
        x={startPoint.x + (labelOptions?.offset?.x || 0)}
        y={startPoint.y + (labelOptions?.offset?.y || 0)}
        fontSize={labelOptions?.fontSize}
      >
        {label}
      </text>
    );
    elements.push(text);
  }
  // Draw the edge arrow
  if (arrowed) {
    const arrowPoints = calculateArrowPoints(endPoint, direction);
    const arrows = arrowPoints.map((p, index) => (
      <line key={`edge__arrow-${index}`} x1={endPoint.x} y1={endPoint.y} x2={p.x} y2={p.y} {...strokeProps} />
    ));
    elements.push(...arrows);
  }
  return <>{elements}</>;
};
