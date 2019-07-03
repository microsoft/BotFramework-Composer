import { Boundary } from '../shared/Boundary';
import { calculateForeachBoundary } from './calculateNodeBoundary';
import { ElementInterval } from '../shared/elementSizes';

const ForeachIntervalY = ElementInterval.y / 2;

export const foreachLayouter = (foreachNode, stepsNode, loopBeginNode, loopEndNode) => {
  if (!foreachNode || !stepsNode) return { boundary: new Boundary() };

  const containerBoundary = calculateForeachBoundary(foreachNode, stepsNode, loopBeginNode, loopEndNode);

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
      id: `edge/${node.id}/loopIndicator[${index}]->right`,
      direction: 'x',
      x: node.offset.x + node.boundary.width,
      y: node.offset.y + node.boundary.axisY,
      length: containerBoundary.width - containerBoundary.axisX - (node.boundary.width - node.boundary.axisX),
    });
  });

  edges.push({
    id: `edge/${foreachNode.id}/loopback-vertical`,
    direction: 'y',
    x: containerBoundary.width,
    y: loopBeginNode.offset.y + loopBeginNode.boundary.axisY,
    length: loopEndNode.offset.y + loopEndNode.boundary.axisY - (loopBeginNode.offset.y + loopBeginNode.boundary.axisY),
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
