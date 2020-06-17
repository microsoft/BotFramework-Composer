// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import { useState, useEffect, useMemo } from 'react';
import { areBoundariesEqual } from '../models/Boundary';
export function useSmartLayout(nodeMap, layouter, onResize) {
  var _a = useState({}),
    boundaryMap = _a[0],
    setBoundaryMap = _a[1];
  /**
   * The object `accumulatedPatches` is used to collect all accumulated
   *  boundary changes happen in a same JS event cyle. After collecting
   *  them together, they will be submitted to component states to guide
   *  next redraw.
   *
   * We shouldn't use `setState()` here because of `patchBoundary` may be
   *  fired multiple times (especially at the init render cycle), changes
   *  will be lost by using `setState()`;
   *
   * We shouldn't use `useRef` here since `accumulatedPatches` as a local
   *  cache needs to be cleared after taking effect in one redraw.
   */
  var accumulatedPatches = {};
  var patchBoundary = function (nodeName, boundary) {
    if (!boundaryMap[nodeName] || !areBoundariesEqual(boundaryMap[nodeName], boundary)) {
      accumulatedPatches[nodeName] = boundary;
      setBoundaryMap(__assign(__assign({}, boundaryMap), accumulatedPatches));
    }
  };
  var layout = useMemo(
    function () {
      // write updated boundaries to nodes
      Object.keys(nodeMap).map(function (nodeName) {
        var node = nodeMap[nodeName];
        if (node) {
          node.boundary = boundaryMap[nodeName] || node.boundary;
        }
      });
      return layouter(nodeMap);
    },
    [nodeMap, boundaryMap]
  );
  useEffect(
    function () {
      onResize && onResize(layout.boundary);
    },
    [layout]
  );
  return {
    layout: layout,
    updateNodeBoundary: patchBoundary,
  };
}
//# sourceMappingURL=useSmartLayout.js.map
