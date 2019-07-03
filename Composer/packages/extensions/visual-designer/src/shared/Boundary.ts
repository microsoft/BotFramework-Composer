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
export class Boundary {
  width = 0;
  height = 0;
  axisX = 0;
  axisY = 0;

  constructor(width = 0, height = 0) {
    this.width = width;
    this.height = height;
    this.axisX = this.width / 2;
    this.axisY = this.height / 2;
  }
}

export function areBoundariesEqual(a, b) {
  return a.width === b.width && a.height === b.height && a.axisX === b.axisX && a.axisY === b.axisY;
}
