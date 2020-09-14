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
export declare class Boundary {
  width: number;
  height: number;
  axisX: number;
  axisY: number;
  constructor(width?: number, height?: number);
}
export declare function areBoundariesEqual(a: any, b: any): boolean;
//# sourceMappingURL=Boundary.d.ts.map
