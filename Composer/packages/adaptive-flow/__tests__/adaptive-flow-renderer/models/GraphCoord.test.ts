// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Boundary } from '../../../src/adaptive-flow-renderer/models/Boundary';
import { GraphCoord } from '../../../src/adaptive-flow-renderer/models/GraphCoord';
import { DT } from '../../../src/adaptive-flow-renderer/models/GraphDistanceUtils';
import { GraphNode } from '../../../src/adaptive-flow-renderer/models/GraphNode';

describe('GraphCoord', () => {
  it('can manage 1 node', () => {
    const node = new GraphNode('0', {}, new Boundary(100, 50));
    const coord = new GraphCoord(node, []);
    expect(coord.boundary).toEqual(new Boundary(100, 50));
    expect(coord.sharedDistance).toEqual([0, 0]);

    expect(node.offset).toEqual({ x: 0, y: 0 });
    coord.moveCoordTo(1, 2);
    expect(node.offset).toEqual({ x: 1, y: 2 });
  });

  it('can manage >1 nodes', () => {
    const n1 = new GraphNode('1', {}, new Boundary(2, 1));
    const n2 = new GraphNode('2', {}, new Boundary(8, 3));
    const coord = new GraphCoord(n1, [[n2, [DT.AxisX, 2], [DT.BottomMargin, 10]]]);
    expect(coord.sharedDistance).toEqual([1, 0]);
    expect(coord.boundary).toEqual({ width: 8, height: 14, axisX: 2, axisY: 7 });

    expect(n2.offset).toEqual({ x: 0, y: 0 });
    coord.moveCoordTo(10, 20);
    expect(n2.offset).toEqual({ x: 10, y: 31 });
  });
});
