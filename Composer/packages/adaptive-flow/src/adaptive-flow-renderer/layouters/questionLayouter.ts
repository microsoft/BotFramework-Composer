// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BranchIntervalX, BranchIntervalY, ElementInterval } from '../constants/ElementSizes';
import { GraphNode } from '../models/GraphNode';
import { GraphLayout } from '../models/GraphLayout';
import { Edge, EdgeDirection } from '../models/EdgeData';
import { QuestionType } from '../widgets/Question/QuestionType';
import { Boundary } from '../models/Boundary';
import { GraphCoord } from '../models/GraphCoord';
import { DT } from '../models/GraphDistanceUtils';

export function questionLayouter(
  questionNode: GraphNode | null,
  choiceNodes: GraphNode[],
  branchNodes: GraphNode[] = []
): GraphLayout {
  if (!questionNode) {
    return new GraphLayout();
  }
  const questionType = questionNode?.data?.type;

  switch (questionType) {
    case QuestionType.choice:
      return questionLayouterBranchingWithConvergence(questionNode, choiceNodes, branchNodes);
    case QuestionType.confirm:
      return questionLayouterBranching(questionNode, choiceNodes, branchNodes);
    case QuestionType.text:
    case QuestionType.number:
    default:
      return questionLayouterNonBranching(questionNode);
  }
}

/**
 *        [question]
 *           |
 *       ------------
 *      |   |  |   |
 */
function questionLayouterBranching(
  questionNode: GraphNode | null,
  choiceNodes: GraphNode[],
  branchNodes: GraphNode[] = []
): GraphLayout {
  if (!questionNode || !branchNodes.length) {
    return new GraphLayout();
  }

  const choiceWithBranchNodes: GraphCoord[] = [];
  for (let i = 0; i < Math.min(choiceNodes.length, branchNodes.length); i++) {
    choiceWithBranchNodes.push(
      new GraphCoord(choiceNodes[i], [[branchNodes[i], [DT.AxisX, 0], [DT.BottomMargin, ElementInterval.y / 2]]])
    );
  }

  const contentCoord = GraphCoord.topAlignWithInterval(choiceWithBranchNodes, BranchIntervalX, false);
  // HACK: increase bottom space to hide following nodes if any
  // TODO: the good approach is only allow question nodes created at the end of actions
  contentCoord.boundary.height += 200;
  const questionCoord = new GraphCoord(questionNode, [
    [contentCoord, [DT.AxisX, 0], [DT.BottomMargin, BranchIntervalY * 2]],
  ]);
  questionCoord.moveCoordTo(0, 0);

  const edges: Edge[] = calculateEdges(questionCoord.boundary, questionNode, branchNodes);

  return {
    boundary: questionCoord.boundary,
    nodeMap: { questionNode, choiceNodes: choiceNodes as any, branchNodes: branchNodes as any },
    edges,
    nodes: [],
  };
}

/**
 *        [question]
 *           |
 *       ------------
 *      |   |  |   |
 */
function questionLayouterBranchingWithConvergence(
  questionNode: GraphNode | null,
  choiceNodes: GraphNode[],
  branchNodes: GraphNode[] = []
): GraphLayout {
  if (!questionNode || !branchNodes.length) {
    return new GraphLayout();
  }

  const choiceWithBranchNodes: GraphCoord[] = [];
  for (let i = 0; i < Math.min(choiceNodes.length, branchNodes.length); i++) {
    choiceWithBranchNodes.push(
      new GraphCoord(choiceNodes[i], [[branchNodes[i], [DT.AxisX, 0], [DT.BottomMargin, ElementInterval.y / 2]]])
    );
  }

  const contentCoord = GraphCoord.topAlignWithInterval(choiceWithBranchNodes, BranchIntervalX, false);
  // HACK: increase bottom space to hide following nodes if any
  contentCoord.boundary.height += 200;
  const questionCoord = new GraphCoord(questionNode, [
    [contentCoord, [DT.AxisX, 0], [DT.BottomMargin, BranchIntervalY * 2]],
  ]);
  questionCoord.moveCoordTo(0, 0);

  const edges: Edge[] = calculateEdges(questionCoord.boundary, questionNode, branchNodes);

  return {
    boundary: questionCoord.boundary,
    nodeMap: { questionNode, choiceNodes: choiceNodes as any, branchNodes: branchNodes as any },
    edges,
    nodes: [],
  };
}

function calculateEdges(containerBoundary: Boundary, questionNode: GraphNode, branchNodes: GraphNode[]) {
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
    edges.push({
      id: `edge/${questionNode.id}/case/baseline->${x.id}`,
      direction: EdgeDirection.Down,
      x: x.offset.x + x.boundary.axisX,
      y: BaselinePositionY,
      length: x.offset.y - BaselinePositionY,
      options: { label: x.data.label },
    });
  });

  if (branchNodes.length > 1) {
    const firstBranchNode = branchNodes[0] || new GraphNode();
    const lastBranchNode = branchNodes[branchNodes.length - 1] || new GraphNode();
    const linePositionX = firstBranchNode.offset.x + firstBranchNode.boundary.axisX;
    const baseLineLength = lastBranchNode.offset.x + lastBranchNode.boundary.axisX - linePositionX;

    edges.push({
      id: `edge/${questionNode.id}/baseline`,
      direction: EdgeDirection.Right,
      x: linePositionX,
      y: BaselinePositionY,
      length: baseLineLength,
    });
  }
  return edges;
}

function questionLayouterNonBranching(questionNode: GraphNode): GraphLayout {
  return {
    boundary: new Boundary(300, 286),
    nodeMap: { questionNode },
    edges: [],
    nodes: [],
  };
}
