// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { GraphNode } from '../models/GraphNode';
import { ElementInterval } from '../constants/ElementSizes';
import { GraphLayout } from '../models/GraphLayout';
import { Edge, EdgeDirection } from '../models/EdgeData';

import { calculateSequenceBoundary } from './calculateNodeBoundary';

const StepInterval = ElementInterval.y;
const ExtraEdgeLength = ElementInterval.y;

export function sequentialLayouter(nodes: GraphNode[], withHeadEdge = true, withTrailingEdge = true): GraphLayout {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return new GraphLayout();
  }

  const box = calculateSequenceBoundary(
    nodes.map((x) => x.boundary),
    withHeadEdge,
    withTrailingEdge
  );

  nodes.reduce((offsetY, node) => {
    node.offset = { x: box.axisX - node.boundary.axisX, y: offsetY };
    return offsetY + node.boundary.height + StepInterval;
  }, 0);

  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const { id, boundary, offset } = nodes[i];
    const x = box.axisX;
    const y = boundary.height + offset.y;
    edges.push({
      id: `edge/${id}->next`,
      direction: EdgeDirection.Down,
      x,
      y,
      length: StepInterval,
      options: { directed: true },
    });
  }

  if (withHeadEdge) {
    nodes.forEach((node) => {
      node.offset.y += ExtraEdgeLength;
    });
    edges.forEach((edge) => {
      edge.y += ExtraEdgeLength;
    });
    edges.unshift({
      id: `edge/head/${nodes[0].id}--before`,
      direction: EdgeDirection.Down,
      x: box.axisX,
      y: 0,
      length: ExtraEdgeLength,
      options: { directed: true },
    });
  }

  if (withTrailingEdge) {
    edges.push({
      id: `edge/tail/${nodes[nodes.length - 1].id}--after`,
      direction: EdgeDirection.Down,
      x: box.axisX,
      y: box.height - ExtraEdgeLength,
      length: ExtraEdgeLength,
    });
  }

  return { boundary: box, nodes, edges, nodeMap: {} };
}
