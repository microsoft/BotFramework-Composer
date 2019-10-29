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
import { ElementInterval, BranchIntervalMinX } from '../constants/ElementSizes';
import { GraphNode } from '../models/GraphNode';
import { GraphLayout } from '../models/GraphLayout';
import { EdgeData } from '../models/EdgeData';

import { calculateSwitchCaseBoundary } from './calculateNodeBoundary';

const BranchIntervalX = ElementInterval.x;
const BranchIntervalY = ElementInterval.y / 2;

/**
 *        [switch]
 *           |
 *           ------------
 *           |   |  |   |
 */
export function switchCaseLayouter(
  conditionNode: GraphNode | null,
  choiceNode: GraphNode,
  branchNodes: GraphNode[] = []
): GraphLayout {
  if (!conditionNode) {
    return new GraphLayout();
  }

  const containerBoundary = calculateSwitchCaseBoundary(
    conditionNode.boundary,
    choiceNode.boundary,
    branchNodes.map(x => x.boundary)
  );

  /** Calulate nodes position */
  conditionNode.offset = {
    x: containerBoundary.axisX - conditionNode.boundary.axisX,
    y: 0,
  };
  choiceNode.offset = {
    x: containerBoundary.axisX - choiceNode.boundary.axisX,
    y: conditionNode.offset.y + conditionNode.boundary.height + BranchIntervalY,
  };

  const BottomelinePositionY = containerBoundary.height;

  const firstBranchNode = branchNodes[0] || new GraphNode();
  branchNodes.reduce((accOffsetX, x) => {
    x.offset = {
      x: accOffsetX,
      y: choiceNode.offset.y + choiceNode.boundary.height + BranchIntervalY,
    };
    return accOffsetX + Math.max(BranchIntervalX + x.boundary.width, BranchIntervalMinX);
  }, containerBoundary.axisX - firstBranchNode.boundary.axisX);

  /** Calculate edges */
  const edges: EdgeData[] = [];
  edges.push({
    id: `edge/${conditionNode.id}/switch/condition->switch`,
    direction: 'y',
    x: containerBoundary.axisX,
    y: conditionNode.offset.y + conditionNode.boundary.height,
    length: BranchIntervalY,
  });

  const BaselinePositionY = choiceNode.offset.y + choiceNode.boundary.axisY;
  branchNodes.forEach(x => {
    edges.push(
      {
        id: `edge/${choiceNode.id}/case/baseline->${x.id}`,
        direction: 'y',
        x: x.offset.x + x.boundary.axisX,
        y: BaselinePositionY,
        length: x.offset.y - BaselinePositionY,
        text: x.data.label,
      },
      {
        id: `edge/${choiceNode.id}/case/${x.id}->bottom`,
        direction: 'y',
        x: x.offset.x + x.boundary.axisX,
        y: x.offset.y + x.boundary.height,
        length: BottomelinePositionY - x.offset.y - x.boundary.height,
      }
    );
  });

  if (branchNodes.length > 1) {
    const lastBranchNode = branchNodes[branchNodes.length - 1] || new GraphNode();
    const baseLineLength = lastBranchNode.offset.x + lastBranchNode.boundary.axisX - containerBoundary.axisX;

    edges.push(
      {
        id: `edge/${conditionNode.id}/baseline`,
        direction: 'x',
        x: containerBoundary.axisX,
        y: BaselinePositionY,
        length: baseLineLength,
      },
      {
        id: `edge/${conditionNode.id}/bottomline`,
        direction: 'x',
        x: containerBoundary.axisX,
        y: BottomelinePositionY,
        length: baseLineLength,
      }
    );
  }

  // TODO: remove this 'any' type conversion after LogicFlow PR.
  return {
    boundary: containerBoundary,
    nodeMap: { conditionNode, choiceNode, branchNodes: branchNodes as any },
    edges,
    nodes: [],
  };
}
