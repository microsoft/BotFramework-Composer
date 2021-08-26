// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Boundary } from './Boundary';
import { CoordDistance, RelativeDistanceX, RelativeDistanceY, transformRelativeDistance } from './GraphDistanceUtils';
import { GraphNode } from './GraphNode';

type GraphElement = GraphCoord | GraphNode;

export class GraphCoord {
  boundary: Boundary = new Boundary();
  sharedDistance: CoordDistance = [0, 0];
  private coordNodes: [GraphElement, CoordDistance][];

  constructor(anchorNode: GraphElement, relativeNodes: [GraphElement, RelativeDistanceX, RelativeDistanceY][]) {
    this.coordNodes = this.computeCoordDistance(anchorNode, relativeNodes);
    this.computeAndSetCoord(this.coordNodes);

    this.boundary.axisX = anchorNode.boundary.axisX + this.sharedDistance[0];
    this.boundary.axisY = this.boundary.height / 2;
  }

  moveCoordTo(x: number, y: number) {
    const [cx, cy] = this.sharedDistance;
    this.coordNodes.forEach(([n, [dx, dy]]) => {
      if (n instanceof GraphNode) {
        n.offset.x = x + cx + dx;
        n.offset.y = y + cy + dy;
      } else {
        // Move children coord recursively
        n.moveCoordTo(x + cx + dx, y + cy + dy);
      }
    });
  }

  private computeCoordDistance(
    anchorNode: GraphElement,
    relativeNodes: [GraphElement, RelativeDistanceX, RelativeDistanceY][]
  ) {
    const result: [GraphElement, CoordDistance][] = [];
    // anchor node distance set to 0, 0
    result.push([anchorNode, [0, 0]]);
    for (const [n, dx, dy] of relativeNodes) {
      const dCoord = transformRelativeDistance(anchorNode.boundary, n.boundary, dx, dy);
      result.push([n, dCoord]);
    }
    return result;
  }

  private computeAndSetCoord(coordNodes: [GraphElement, CoordDistance][]) {
    let [xMin, xMax, yMin, yMax] = [0, 0, 0, 0];
    for (const [{ boundary }, [x, y]] of coordNodes) {
      xMin = Math.min(xMin, x);
      yMin = Math.min(yMin, y);

      xMax = Math.max(xMax, x + boundary.width);
      yMax = Math.max(yMax, y + boundary.height);
    }

    this.boundary.width = xMax - xMin;
    this.boundary.height = yMax - yMin;
    // Avoid returning -0 which breaks jest equation test.
    this.sharedDistance = [xMin === 0 ? 0 : -xMin, yMin === 0 ? 0 : -yMin];
  }
}
