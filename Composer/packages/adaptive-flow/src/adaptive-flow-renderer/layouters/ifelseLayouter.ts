// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { BranchIntervalX, BranchIntervalY } from '../constants/ElementSizes';
import { GraphNode } from '../models/GraphNode';
import { GraphLayout } from '../models/GraphLayout';
import { Edge, EdgeDirection } from '../models/EdgeData';

import { calculateIfElseBoundary } from './calculateNodeBoundary';

export function ifElseLayouter(
  conditionNode: GraphNode | null,
  choiceNode: GraphNode | null,
  ifNode: GraphNode,
  elseNode: GraphNode
): GraphLayout {
  if (!conditionNode || !choiceNode) return new GraphLayout();

  const containerBoundary = calculateIfElseBoundary(
    conditionNode.boundary,
    choiceNode.boundary,
    ifNode.boundary,
    elseNode.boundary
  );

  const leftNode = ifNode || new GraphNode();
  const rightNode = elseNode || new GraphNode();

  const leftNodeText = formatMessage('True');
  const rightNodeText = formatMessage('False');

  // Condition
  conditionNode.offset = {
    x: containerBoundary.axisX - conditionNode.boundary.axisX,
    y: 0,
  };

  // Diamond
  choiceNode.offset = {
    x: containerBoundary.axisX - choiceNode.boundary.axisX,
    y: conditionNode.offset.y + conditionNode.boundary.height + BranchIntervalY,
  };

  const flag = (leftNode ? '1' : '0') + (rightNode ? '1' : '0');
  switch (flag) {
    case '11':
      /**
       *     <Condition>
       *          |
       *      <Choice>  --------
       *          |            |
       *        [left]        [right]
       *          |-------------
       */
      leftNode.offset = {
        x: containerBoundary.axisX - leftNode.boundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.height + BranchIntervalY,
      };
      rightNode.offset = {
        x:
          Math.max(choiceNode.offset.x + choiceNode.boundary.width, leftNode.offset.x + leftNode.boundary.width) +
          BranchIntervalX,
        y: choiceNode.offset.y + choiceNode.boundary.height + BranchIntervalY,
      };
      break;
    case '01':
      /**
       *     <Condition>
       *         |
       *      <Choice>------
       *         |        [right]
       *         |         |
       *         |----------
       */
      rightNode.offset = {
        x: choiceNode.offset.x + choiceNode.boundary.width + BranchIntervalX,
        y: choiceNode.offset.y + choiceNode.boundary.height + BranchIntervalY,
      };
      break;
    case '10':
      /**
       *      <Choice> ----
       *          |       |
       *        [left]    |
       *          |--------
       */
      leftNode.offset = {
        x: containerBoundary.axisX - leftNode.boundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.height + BranchIntervalY,
      };
      break;
    case '00':
      /**
       *   <Condition>
       *       |
       *    <Choice>
       */
      break;
    default:
      break;
  }

  const edgeList: Edge[] = [];
  edgeList.push({
    id: `edge/${conditionNode.id}/condition->choice`,
    direction: EdgeDirection.Down,
    x: containerBoundary.axisX,
    y: conditionNode.offset.y + conditionNode.boundary.height,
    length: BranchIntervalY,
  });

  if (rightNode) {
    edgeList.push(
      {
        id: `edge/${rightNode.id}/right/choice->top}`,
        direction: EdgeDirection.Right,
        x: choiceNode.offset.x + choiceNode.boundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: rightNode.offset.x + rightNode.boundary.axisX - choiceNode.boundary.axisX - choiceNode.offset.x,
      },
      {
        id: `edge/${rightNode.id}/right/top->node}`,
        direction: EdgeDirection.Down,
        x: rightNode.offset.x + rightNode.boundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: BranchIntervalY,
        options: { label: rightNodeText },
      },
      {
        id: `edge/${rightNode.id}/right/node->border.bottom`,
        direction: EdgeDirection.Down,
        x: rightNode.offset.x + rightNode.boundary.axisX,
        y: rightNode.offset.y + rightNode.boundary.height,
        length: containerBoundary.height - (rightNode.offset.y + rightNode.boundary.height),
      },
      {
        id: `edge/${rightNode.id}/right/border.bottom->axis`,
        direction: EdgeDirection.Right,
        x: containerBoundary.axisX,
        y: containerBoundary.height,
        length: rightNode.offset.x + rightNode.boundary.axisX - containerBoundary.axisX,
      }
    );
  } else {
    edgeList.push(
      {
        id: `edge/${choiceNode.id}/right/choice->border.right`,
        direction: EdgeDirection.Right,
        x: choiceNode.offset.x + choiceNode.boundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: containerBoundary.width - (choiceNode.offset.x + choiceNode.boundary.axisX),
      },
      {
        id: `edge/${choiceNode.id}/right/border.top->border.bottom`,
        direction: EdgeDirection.Down,
        x: containerBoundary.width,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: containerBoundary.height - (choiceNode.offset.y + choiceNode.boundary.axisY),
      },
      {
        id: `edge/${choiceNode.id}/right/border.bottom->out`,
        direction: EdgeDirection.Right,
        x: containerBoundary.axisX,
        y: containerBoundary.height,
        length: containerBoundary.width - containerBoundary.axisX,
      }
    );
  }

  if (leftNode) {
    edgeList.push(
      {
        id: `edge/${leftNode.id}/left/choice->else`,
        direction: EdgeDirection.Down,
        x: containerBoundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: BranchIntervalY,
        options: { label: leftNodeText },
      },
      {
        id: `edge/${leftNode.id}/left/else->out`,
        direction: EdgeDirection.Down,
        x: containerBoundary.axisX,
        y: leftNode.offset.y + leftNode.boundary.height,
        length: containerBoundary.height - (leftNode.offset.y + leftNode.boundary.height),
      }
    );
  } else {
    edgeList.push({
      id: `edge/${choiceNode.id}/left/choice->out`,
      direction: EdgeDirection.Down,
      x: containerBoundary.axisX,
      y: choiceNode.offset.y + choiceNode.boundary.axisY,
      length: containerBoundary.height - (choiceNode.offset.y + choiceNode.boundary.height),
      options: { label: leftNodeText },
    });
  }

  return {
    boundary: containerBoundary,
    nodeMap: {
      condition: conditionNode,
      choice: choiceNode,
      if: ifNode,
      else: elseNode,
    },
    edges: edgeList,
    nodes: [],
  };
}
