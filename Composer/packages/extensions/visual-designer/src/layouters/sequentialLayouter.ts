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
import { GraphNode } from '../models/GraphNode';
import { ElementInterval } from '../constants/ElementSizes';
import { GraphLayout } from '../models/GraphLayout';
import { EdgeData } from '../models/EdgeData';

import { calculateSequenceBoundary } from './calculateNodeBoundary';

const StepInterval = ElementInterval.y;
const ExtraEdgeLength = ElementInterval.y / 2;

export function sequentialLayouter(nodes: GraphNode[], withHeadEdge = true, withTrailingEdge = true): GraphLayout {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return new GraphLayout();
  }

  const box = calculateSequenceBoundary(nodes.map(x => x.boundary), withHeadEdge, withTrailingEdge);

  nodes.reduce((offsetY, node) => {
    node.offset = { x: box.axisX - node.boundary.axisX, y: offsetY };
    return offsetY + node.boundary.height + StepInterval;
  }, 0);

  const edges: EdgeData[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const { id, boundary, offset } = nodes[i];
    const x = box.axisX;
    const y = boundary.height + offset.y;
    edges.push({
      id: `edge/${id}->next`,
      direction: 'y',
      x,
      y,
      length: StepInterval,
      directed: true,
    });
  }

  if (withHeadEdge) {
    nodes.forEach(node => {
      node.offset.y += ExtraEdgeLength;
    });
    edges.forEach(edge => {
      edge.y += ExtraEdgeLength;
    });
    edges.unshift({
      id: `edge/head/${nodes[0].id}--before`,
      direction: 'y',
      x: box.axisX,
      y: 0,
      length: ExtraEdgeLength,
      directed: true,
    });
  }

  if (withTrailingEdge) {
    edges.push({
      id: `edge/tail/${nodes[nodes.length - 1].id}--after`,
      direction: 'y',
      x: box.axisX,
      y: box.height - ExtraEdgeLength,
      length: ExtraEdgeLength,
    });
  }

  return { boundary: box, nodes, edges, nodeMap: {} };
}
