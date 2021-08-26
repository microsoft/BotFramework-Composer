// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Boundary } from './Boundary';
import {
  CoordDistance,
  DT,
  RelativeDistanceX,
  RelativeDistanceY,
  transformRelativeDistance,
} from './GraphDistanceUtils';
import { GraphNode } from './GraphNode';

type GraphElement = GraphCoord | GraphNode;

export type GraphElementCoord = [GraphElement, RelativeDistanceX, RelativeDistanceY];

export class GraphCoord {
  boundary: Boundary = new Boundary();
  sharedDistance: CoordDistance = [0, 0];
  offset = [0, 0];
  private coordNodes: [GraphElement, CoordDistance][];

  constructor(anchorNode: GraphElement, relativeNodes: GraphElementCoord[], inheritAxisXFromAnchor = true) {
    this.coordNodes = this.computeCoordDistance(anchorNode, relativeNodes);
    this.computeAndSetCoord(this.coordNodes);

    if (inheritAxisXFromAnchor) {
      this.boundary.axisX = anchorNode.boundary.axisX + this.sharedDistance[0];
    } else {
      this.boundary.axisX = this.boundary.width / 2;
    }
    this.boundary.axisY = this.boundary.height / 2;
  }

  static topAlignWithInterval(graphElements: GraphElement[], interval: number, useFirstElementAxis = true): GraphCoord {
    if (!graphElements.length) return new GraphCoord(new GraphNode('', {}, new Boundary()), []);

    const first = graphElements[0];
    const relativeNodes: GraphElementCoord[] = [];

    let margin = 0;
    for (let i = 1; i < graphElements.length; i++) {
      margin += interval;
      relativeNodes.push([graphElements[i], [DT.RightMargin, margin], [DT.Top, 0]]);
      margin += graphElements[i].boundary.width;
    }

    return new GraphCoord(first, relativeNodes, useFirstElementAxis);
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
        // Record self offset
        this.offset = [x, y];
      }
    });
  }

  private computeCoordDistance(anchorNode: GraphElement, relativeNodes: GraphElementCoord[]) {
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
    const [sx, sy] = this.sharedDistance;
    let [xMin, xMax, yMin, yMax] = [0, 0, 0, 0];
    for (const [{ boundary }, [rx, ry]] of coordNodes) {
      const x = rx + sx;
      const y = ry + sy;
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
