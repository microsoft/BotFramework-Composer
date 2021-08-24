// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BranchIntervalY } from '../constants/ElementSizes';
import { GraphNode } from '../models/GraphNode';
import { GraphLayout } from '../models/GraphLayout';
import { Edge, EdgeDirection } from '../models/EdgeData';

import { calculateQuestionBoundary } from './calculateNodeBoundary';
import { calculateBranchNodesIntervalX } from './sharedLayouterUtils';

/**
 *        [question]
 *           |
 *       ------------
 *      |   |  |   |
 */
export function questionLayouter(questionNode: GraphNode | null, branchNodes: GraphNode[] = []): GraphLayout {
  if (!questionNode) {
    return new GraphLayout();
  }

  const containerBoundary = calculateQuestionBoundary(
    questionNode.boundary,
    branchNodes.map((x) => x.boundary)
  );

  /** Calculate nodes position */
  questionNode.offset = {
    x: containerBoundary.axisX - questionNode.boundary.axisX,
    y: 0,
  };

  const BottomelinePositionY = containerBoundary.height;

  const BranchGroupOffsetX = Math.max(0, questionNode.boundary.axisX - containerBoundary.axisX);
  branchNodes.reduce((accOffsetX, x, currentIndex) => {
    x.offset = {
      x: accOffsetX,
      y: questionNode.offset.y + questionNode.boundary.height + BranchIntervalY,
    };
    return (
      accOffsetX + x.boundary.width + calculateBranchNodesIntervalX(x.boundary, branchNodes[currentIndex + 1]?.boundary)
    );
  }, BranchGroupOffsetX);

  /** Calculate edges */
  const edges: Edge[] = [];
  edges.push({
    id: `edge/${questionNode.id}/switch/condition->switch`,
    direction: EdgeDirection.Down,
    x: containerBoundary.axisX,
    y: questionNode.offset.y + questionNode.boundary.height,
    length: BranchIntervalY,
  });

  const BaselinePositionY = questionNode.offset.y + questionNode.boundary.height + BranchIntervalY;
  branchNodes.forEach((x) => {
    edges.push(
      {
        id: `edge/${questionNode.id}/case/baseline->${x.id}`,
        direction: EdgeDirection.Down,
        x: x.offset.x + x.boundary.axisX,
        y: BaselinePositionY,
        length: x.offset.y - BaselinePositionY,
        options: { label: x.data.label },
      }
      // {
      //   id: `edge/${questionNode.id}/case/${x.id}->bottom`,
      //   direction: EdgeDirection.Down,
      //   x: x.offset.x + x.boundary.axisX,
      //   y: x.offset.y + x.boundary.height,
      //   length: BottomelinePositionY - x.offset.y - x.boundary.height,
      // }
    );
  });

  if (branchNodes.length > 1) {
    const firstBranchNode = branchNodes[0] || new GraphNode();
    const lastBranchNode = branchNodes[branchNodes.length - 1] || new GraphNode();
    const linePositionX = BranchGroupOffsetX + firstBranchNode.boundary.axisX;
    const baseLineLength = lastBranchNode.offset.x + lastBranchNode.boundary.axisX - linePositionX;

    edges.push(
      {
        id: `edge/${questionNode.id}/baseline`,
        direction: EdgeDirection.Right,
        x: linePositionX,
        y: BaselinePositionY,
        length: baseLineLength,
      }
      // {
      //   id: `edge/${questionNode.id}/bottomline`,
      //   direction: EdgeDirection.Right,
      //   x: linePositionX,
      //   y: BottomelinePositionY,
      //   length: baseLineLength,
      // }
    );
  }

  // TODO: remove this 'any' type conversion after LogicFlow PR.
  return {
    boundary: containerBoundary,
    nodeMap: { questionNode, branchNodes: branchNodes as any },
    edges,
    nodes: [],
  };
}
