// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
export var ArrowLine = function (_a) {
  var width = _a.width,
    arrowsize = _a.arrowsize,
    color = _a.color;
  var points = [
    { x: 0, y: 0 },
    { x: width / 2 - (arrowsize + 2), y: 0 },
    { x: width / 2, y: arrowsize },
    { x: width / 2 + (arrowsize + 2), y: 0 },
    { x: width, y: 0 },
  ];
  var pointsString = points
    .map(function (p) {
      return p.x + ',' + p.y;
    })
    .join(' ');
  return jsx(
    'svg',
    { css: { display: 'block' }, height: 1, overflow: 'visible', width: width },
    jsx('polyline', { fill: 'none', points: pointsString, stroke: color, strokeDasharray: 'none', strokeWidth: '1' })
  );
};
ArrowLine.defaultProps = {
  width: 200,
  arrowsize: 8,
  containerHeight: 1,
  color: 'black',
};
//# sourceMappingURL=ArrowLine.js.map
