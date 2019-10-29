/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { ElementInterval } from '../constants/ElementSizes';
import { GraphNode } from '../models/GraphNode';
import { GraphLayout } from '../models/GraphLayout';
import { EdgeData } from '../models/EdgeData';

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

  const edges: EdgeData[] = [];

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
      directed: index === 0 ? true : false,
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
    nodes: [],
  };
};
