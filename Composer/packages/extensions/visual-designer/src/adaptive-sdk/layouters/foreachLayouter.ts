// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ElementInterval } from '../constants/ElementSizes';
import { GraphNode } from '../models/GraphNode';
import { GraphLayout } from '../models/GraphLayout';
import { Edge, EdgeDirection } from '../models/EdgeData';

import { calculateForeachBoundary } from './calculateNodeBoundary';

const ForeachIntervalY = ElementInterval.y / 2;

export const foreachLayouter = (
  foreachNode: GraphNode | null,
  stepsNode: GraphNode | null,
  loopBeginNode: GraphNode,
  loopEndNode: GraphNode
): GraphLayout => {
  if (!foreachNode || !stepsNode) return new GraphLayout();

  const containerBoundary = calculateForeachBoundary(
    foreachNode.boundary,
    stepsNode.boundary,
    loopBeginNode.boundary,
    loopEndNode.boundary
  );

  foreachNode.offset = {
    x: containerBoundary.axisX - foreachNode.boundary.axisX,
    y: 0,
  };

  loopBeginNode.offset = {
    x: containerBoundary.axisX - loopBeginNode.boundary.axisX,
    y: foreachNode.offset.y + foreachNode.boundary.height + ForeachIntervalY,
  };

  stepsNode.offset = {
    x: containerBoundary.axisX - stepsNode.boundary.axisX,
    y: loopBeginNode.offset.y + loopBeginNode.boundary.height + ForeachIntervalY,
  };

  loopEndNode.offset = {
    x: containerBoundary.axisX - loopEndNode.boundary.axisX,
    y: stepsNode.offset.y + stepsNode.boundary.height + ForeachIntervalY,
  };

  const edges: Edge[] = [];

  [foreachNode, loopBeginNode, stepsNode].forEach((node, index) => {
    edges.push({
      id: `edge/axisX/${node.id}-${index}`,
      direction: EdgeDirection.Down,
      x: containerBoundary.axisX,
      y: node.offset.y + node.boundary.height,
      length: ForeachIntervalY,
    });
  });

  [loopBeginNode, loopEndNode].forEach((node, index) => {
    edges.push({
      id: `edge/${node.id}/loopIndicator[${index}]->left`,
      direction: EdgeDirection.Right,
      x: 0,
      y: node.offset.y + node.boundary.axisY,
      length: containerBoundary.axisX - node.boundary.axisX,
      options: {
        dashed: true,
        directed: index === 0,
      },
    });
  });

  edges.push({
    id: `edge/${foreachNode.id}/loopback-vertical`,
    direction: EdgeDirection.Down,
    x: 0,
    y: loopBeginNode.offset.y + loopBeginNode.boundary.axisY,
    length: loopEndNode.offset.y + loopEndNode.boundary.axisY - (loopBeginNode.offset.y + loopBeginNode.boundary.axisY),
    options: { dashed: true },
  });

  return {
    boundary: containerBoundary,
    nodeMap: {
      foreachNode,
      stepsNode,
      loopBeginNode,
      loopEndNode,
    },
    edges,
    nodes: [],
  };
};
