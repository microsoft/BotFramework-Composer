import { Boundary } from '../shared/Boundary';
import { ElementInterval } from '../shared/elementSizes';
import { GraphNode } from '../shared/GraphNode';
import { GraphLayout } from '../shared/GraphLayout';

import { calculateForeachBoundary } from './calculateNodeBoundary';

const ForeachIntervalY = ElementInterval.y / 2;

export const foreachLayouter = (
  foreachNode: GraphNode | null,
  stepsNode: GraphNode | null,
  loopBeginNode: GraphNode,
  loopEndNode: GraphNode
): GraphLayout => {
  if (!foreachNode || !stepsNode) return { boundary: new Boundary() };

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

  const edges: any[] = [];

  [foreachNode, loopBeginNode, stepsNode].forEach((node, index) => {
    edges.push({
      id: `edge/axisX/${node.id}-${index}`,
      direction: 'y',
      x: containerBoundary.axisX,
      y: node.offset.y + node.boundary.height,
      length: ForeachIntervalY,
    });
  });

  [loopBeginNode, loopEndNode].forEach((node, index) => {
    edges.push({
      id: `edge/${node.id}/loopIndicator[${index}]->left`,
      direction: 'x',
      x: 0,
      y: node.offset.y + node.boundary.axisY,
      length: containerBoundary.axisX - node.boundary.axisX,
      dashed: true,
    });
  });

  edges.push({
    id: `edge/${foreachNode.id}/loopback-vertical`,
    direction: 'y',
    x: 0,
    y: loopBeginNode.offset.y + loopBeginNode.boundary.axisY,
    length: loopEndNode.offset.y + loopEndNode.boundary.axisY - (loopBeginNode.offset.y + loopBeginNode.boundary.axisY),
    dashed: true,
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
  };
};
