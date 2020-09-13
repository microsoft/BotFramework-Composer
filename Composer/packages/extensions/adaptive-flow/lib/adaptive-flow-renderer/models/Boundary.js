// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Describe a rectangle's boundary and its connection point.
 *
 *                    (0, axisX)
 *                    ---o------
 *                    |         |
 *        (0, axisY)  o         o (width, axisY)
 *                    |         |
 *                    ---o-------
 *                 (height, axisX)
 */
var Boundary = /** @class */ (function () {
  function Boundary(width, height) {
    if (width === void 0) {
      width = 0;
    }
    if (height === void 0) {
      height = 0;
    }
    this.width = 0;
    this.height = 0;
    this.axisX = 0;
    this.axisY = 0;
    this.width = width;
    this.height = height;
    this.axisX = this.width / 2;
    this.axisY = this.height / 2;
  }
  return Boundary;
})();
export { Boundary };
export function areBoundariesEqual(a, b) {
  return a.width === b.width && a.height === b.height && a.axisX === b.axisX && a.axisY === b.axisY;
}
//# sourceMappingURL=Boundary.js.map
