// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BranchIntervalY } from '../constants/ElementSizes';
import { GraphNode } from '../models/GraphNode';
import { GraphLayout } from '../models/GraphLayout';
import { Edge, EdgeDirection } from '../models/EdgeData';
import { QuestionType } from '../widgets/Question/QuestionType';
import { Boundary } from '../models/Boundary';
import { GraphCoord, GraphElementCoord } from '../models/GraphCoord';
import { DT } from '../models/GraphDistanceUtils';

import { calculateBranchNodesIntervalX } from './sharedLayouterUtils';

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

  const branchesCoord = GraphCoord.topAlignWithInterval(branchNodes, BranchIntervalY, false);
  const questionCoord = new GraphCoord(questionNode, [
    [branchesCoord, [DT.AxisX, 0], [DT.BottomMargin, BranchIntervalY]],
  ]);
  questionCoord.moveCoordTo(0, 0);

  const edges: Edge[] = calculateEdges(questionNode, questionCoord, branchNodes, branchesCoord);

  return {
    boundary: questionCoord.boundary,
    nodeMap: { questionNode, branchNodes: branchNodes as any },
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

  const branchesOtherNodesPos: GraphElementCoord[] = [];
  let totalMargin = 0;
  for (let i = 1; i < branchNodes.length; i++) {
    const currNode = branchNodes[i];
    totalMargin += calculateBranchNodesIntervalX(branchNodes[i - 1].boundary, currNode.boundary);
    branchesOtherNodesPos.push([currNode, [DT.RightMargin, totalMargin], [DT.Top, 0]]);
    totalMargin += currNode.boundary.width;
  }
  const branchesCoord = new GraphCoord(branchNodes[0], branchesOtherNodesPos, false);
  const questionCoord = new GraphCoord(questionNode, [
    [branchesCoord, [DT.AxisX, 0], [DT.BottomMargin, BranchIntervalY]],
  ]);
  questionCoord.moveCoordTo(0, 0);

  const edges: Edge[] = calculateEdges(questionNode, questionCoord, branchNodes, branchesCoord);

  return {
    boundary: questionCoord.boundary,
    nodeMap: { questionNode, branchNodes: branchNodes as any },
    edges,
    nodes: [],
  };
}

function calculateEdges(
  questionNode: GraphNode,
  questionCoord: GraphCoord,
  branchNodes: GraphNode[],
  branchesCoord: GraphCoord
) {
  const edges: Edge[] = [];
  edges.push({
    id: `edge/${questionNode.id}/switch/condition->switch`,
    direction: EdgeDirection.Down,
    x: questionCoord.boundary.axisX,
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
    const linePositionX = branchesCoord.offset[0] + firstBranchNode.boundary.axisX;
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
