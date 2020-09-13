// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { measureJsonBoundary } from '../layouters/measureJsonBoundary';
import { Boundary } from './Boundary';
var CoordPoint = /** @class */ (function () {
  function CoordPoint(x, y) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    this.x = x;
    this.y = y;
  }
  return CoordPoint;
})();
var GraphNode = /** @class */ (function () {
  function GraphNode(id, data, boundary) {
    if (id === void 0) {
      id = '';
    }
    if (data === void 0) {
      data = {};
    }
    if (boundary === void 0) {
      boundary = new Boundary();
    }
    this.id = '';
    this.data = {};
    this.offset = new CoordPoint();
    this.id = id;
    this.data = data;
    this.boundary = boundary;
  }
  GraphNode.fromIndexedJson = function (indexedJson) {
    if (!indexedJson) throw new Error('Invalid input json');
    var node = new GraphNode(indexedJson.id, indexedJson.json);
    node.boundary = measureJsonBoundary(indexedJson.json);
    return node;
  };
  return GraphNode;
})();
export { GraphNode };
//# sourceMappingURL=GraphNode.js.map
