// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { EdgeDirection, EdgeOptions, Edge } from '../../models/EdgeData';
import { ObiColors } from '../../constants/ElementColors';

interface Coord2D {
  x: number;
  y: number;
}

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
        { x: endPoint.x - arrowSize, y: endPoint.y + arrowSize },
        { x: endPoint.x + arrowSize, y: endPoint.y + arrowSize },
      ];
    case EdgeDirection.Down:
      return [
        { x: endPoint.x - arrowSize, y: endPoint.y - arrowSize },
        { x: endPoint.x + arrowSize, y: endPoint.y - arrowSize },
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

const getDefaultEdgeOptions = (direction: EdgeDirection): EdgeOptions => {
  const defaultTextOffsets = {
    [EdgeDirection.Right]: { x: 8, y: -5 },
    [EdgeDirection.Left]: { x: -28, y: -5 },
    [EdgeDirection.Up]: { x: -22, y: -8 },
    [EdgeDirection.Down]: { x: 8, y: 22 },
  };

  return {
    color: ObiColors.AzureGray2,
    labelOptions: {
      offset: defaultTextOffsets[direction],
      fontSize: 14,
    },
  };
};

const loadOptions = (direction: EdgeDirection, inputOptions?: EdgeOptions): EdgeOptions => {
  const defaultEdgeOptions = getDefaultEdgeOptions(direction);
  const edgeOptions = inputOptions ? { ...defaultEdgeOptions, ...inputOptions } : defaultEdgeOptions;
  return edgeOptions;
};

export const drawSVGEdge = (
  id: string,
  x: number,
  y: number,
  direction: EdgeDirection,
  length: number,
  options?: EdgeOptions
): JSX.Element[] => {
  if (length <= 0) return [];

  const startPoint = { x, y };
  const edgeOptions = loadOptions(direction, options);
  const { directed, color, dashed, label, labelOptions } = edgeOptions;
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
      <line
        key={`edge-${id}__line`}
        data-testid={`edge-${id}__line`}
        x1={startPoint.x}
        x2={endPoint.x}
        y1={startPoint.y}
        y2={endPoint.y}
        {...strokeProps}
      />
    );
    elements.push(line);
  }
  // Draw the edge label
  if (typeof label === 'string' || typeof label === 'number') {
    const text = (
      <text
        key={`edge-${id}__text`}
        fontSize={labelOptions?.fontSize}
        x={startPoint.x + (labelOptions?.offset?.x || 0)}
        y={startPoint.y + (labelOptions?.offset?.y || 0)}
      >
        {label}
      </text>
    );
    elements.push(text);
  }
  // Draw the edge arrow
  if (directed) {
    const [p1, p2] = calculateArrowPoints(endPoint, direction);
    const points = [p1, endPoint, p2].map((p) => `${p.x},${p.y}`).join(' ');
    const arrow = (
      <polyline key={`edge-${id}__arrow`} points={points} {...strokeProps} fill="none" strokeDasharray="none" />
    );
    elements.push(arrow);
  }
  return elements;
};

export const renderEdge = (edge: Edge): JSX.Element[] => {
  const { id, x, y, direction, length, options } = edge;
  return drawSVGEdge(id, x, y, direction, length, options);
};
