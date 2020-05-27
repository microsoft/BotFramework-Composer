// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BranchIntervalY } from '../constants/ElementSizes';
import { GraphNode } from '../models/GraphNode';
import { GraphLayout } from '../models/GraphLayout';
import { Edge, EdgeDirection } from '../models/EdgeData';

import { calculateSwitchCaseBoundary } from './calculateNodeBoundary';
import { calculateBranchNodesIntervalX } from './sharedLayouterUtils';

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
    branchNodes.map((x) => x.boundary)
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
  branchNodes.reduce((accOffsetX, x, currentIndex) => {
    x.offset = {
      x: accOffsetX,
      y: choiceNode.offset.y + choiceNode.boundary.height + BranchIntervalY,
    };
    return (
      accOffsetX + x.boundary.width + calculateBranchNodesIntervalX(x.boundary, branchNodes[currentIndex + 1]?.boundary)
    );
  }, containerBoundary.axisX - firstBranchNode.boundary.axisX);

  /** Calculate edges */
  const edges: Edge[] = [];
  edges.push({
    id: `edge/${conditionNode.id}/switch/condition->switch`,
    direction: EdgeDirection.Down,
    x: containerBoundary.axisX,
    y: conditionNode.offset.y + conditionNode.boundary.height,
    length: BranchIntervalY,
  });

  const BaselinePositionY = choiceNode.offset.y + choiceNode.boundary.axisY;
  branchNodes.forEach((x) => {
    edges.push(
      {
        id: `edge/${choiceNode.id}/case/baseline->${x.id}`,
        direction: EdgeDirection.Down,
        x: x.offset.x + x.boundary.axisX,
        y: BaselinePositionY,
        length: x.offset.y - BaselinePositionY,
        options: { label: x.data.label },
      },
      {
        id: `edge/${choiceNode.id}/case/${x.id}->bottom`,
        direction: EdgeDirection.Down,
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
        direction: EdgeDirection.Right,
        x: containerBoundary.axisX,
        y: BaselinePositionY,
        length: baseLineLength,
      },
      {
        id: `edge/${conditionNode.id}/bottomline`,
        direction: EdgeDirection.Right,
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
