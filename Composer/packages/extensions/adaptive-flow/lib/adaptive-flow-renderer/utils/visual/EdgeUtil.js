// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign } from 'tslib';
import React from 'react';
import { EdgeDirection } from '../../models/EdgeData';
import { ObiColors } from '../../constants/ElementColors';
var calculateEdgeEndPoint = function (startPoint, direction, length) {
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
var calculateArrowPoints = function (endPoint, direction, arrowSize) {
  if (arrowSize === void 0) {
    arrowSize = 5;
  }
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
var getDefaultEdgeOptions = function (direction) {
  var _a;
  var defaultTextOffsets =
    ((_a = {}),
    (_a[EdgeDirection.Right] = { x: 8, y: -5 }),
    (_a[EdgeDirection.Left] = { x: -28, y: -5 }),
    (_a[EdgeDirection.Up] = { x: -22, y: -8 }),
    (_a[EdgeDirection.Down] = { x: 8, y: 22 }),
    _a);
  return {
    color: ObiColors.AzureGray2,
    labelOptions: {
      offset: defaultTextOffsets[direction],
      fontSize: 14,
    },
  };
};
var loadOptions = function (direction, inputOptions) {
  var defaultEdgeOptions = getDefaultEdgeOptions(direction);
  var edgeOptions = inputOptions ? __assign(__assign({}, defaultEdgeOptions), inputOptions) : defaultEdgeOptions;
  return edgeOptions;
};
export var drawSVGEdge = function (id, x, y, direction, length, options) {
  var _a, _b;
  if (length <= 0) return [];
  var startPoint = { x: x, y: y };
  var edgeOptions = loadOptions(direction, options);
  var directed = edgeOptions.directed,
    color = edgeOptions.color,
    dashed = edgeOptions.dashed,
    label = edgeOptions.label,
    labelOptions = edgeOptions.labelOptions;
  var strokeProps = {
    strokeDasharray: dashed ? '4' : 'none',
    strokeWidth: '1',
    stroke: color,
  };
  var endPoint = calculateEdgeEndPoint(startPoint, direction, length);
  var elements = [];
  // Draw the edge line
  if (length > 0) {
    var line = React.createElement(
      'line',
      __assign(
        { key: 'edge-' + id + '__line', x1: startPoint.x, x2: endPoint.x, y1: startPoint.y, y2: endPoint.y },
        strokeProps
      )
    );
    elements.push(line);
  }
  // Draw the edge label
  if (typeof label === 'string' || typeof label === 'number') {
    var text = React.createElement(
      'text',
      {
        key: 'edge-' + id + '__text',
        fontSize: labelOptions === null || labelOptions === void 0 ? void 0 : labelOptions.fontSize,
        x:
          startPoint.x +
          (((_a = labelOptions === null || labelOptions === void 0 ? void 0 : labelOptions.offset) === null ||
          _a === void 0
            ? void 0
            : _a.x) || 0),
        y:
          startPoint.y +
          (((_b = labelOptions === null || labelOptions === void 0 ? void 0 : labelOptions.offset) === null ||
          _b === void 0
            ? void 0
            : _b.y) || 0),
      },
      label
    );
    elements.push(text);
  }
  // Draw the edge arrow
  if (directed) {
    var _c = calculateArrowPoints(endPoint, direction),
      p1 = _c[0],
      p2 = _c[1];
    var points = [p1, endPoint, p2]
      .map(function (p) {
        return p.x + ',' + p.y;
      })
      .join(' ');
    var arrow = React.createElement(
      'polyline',
      __assign({ key: 'edge-' + id + '__arrow', points: points }, strokeProps, {
        fill: 'none',
        strokeDasharray: 'none',
      })
    );
    elements.push(arrow);
  }
  return elements;
};
export var renderEdge = function (edge) {
  var id = edge.id,
    x = edge.x,
    y = edge.y,
    direction = edge.direction,
    length = edge.length,
    options = edge.options;
  return drawSVGEdge(id, x, y, direction, length, options);
};
//# sourceMappingURL=EdgeUtil.js.map
