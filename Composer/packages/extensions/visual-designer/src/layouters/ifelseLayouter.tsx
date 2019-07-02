import { Boundary } from '../shared/Boundary';
import { ElementInterval } from '../shared/elementSizes';
import { GraphNode } from '../shared/GraphNode';

import { calculateIfElseBoundary } from './calculateNodeBoundary';

const BranchIntervalX = ElementInterval.x;
const BranchIntervalY = ElementInterval.y / 2;

export function ifElseLayouter(conditionNode, choiceNode, ifNode, elseNode) {
  if (!conditionNode || !choiceNode) return { boundary: new Boundary() };

  const containerBoundary = calculateIfElseBoundary(conditionNode, choiceNode, ifNode, elseNode);

  const leftNode = ifNode || new GraphNode();
  const rightNode = elseNode || new GraphNode();

  const leftNodeText = 'True';
  const rightNodeText = 'False';

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

  const edgeList: { [key: string]: any } = [];
  edgeList.push({
    id: `edge/${conditionNode.id}/condition->choice`,
    direction: 'y',
    x: containerBoundary.axisX,
    y: conditionNode.offset.y + conditionNode.boundary.height,
    length: BranchIntervalY,
  });

  if (rightNode) {
    edgeList.push(
      {
        id: `edge/${rightNode.id}/right/choice->top}`,
        direction: 'x',
        x: choiceNode.offset.x + choiceNode.boundary.width,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: rightNode.offset.x + rightNode.boundary.axisX - choiceNode.boundary.width - choiceNode.offset.x,
        text: rightNodeText,
      },
      {
        id: `edge/${rightNode.id}/right/top->node}`,
        direction: 'y',
        x: rightNode.offset.x + rightNode.boundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: BranchIntervalY,
      },
      {
        id: `edge/${rightNode.id}/right/node->border.bottom`,
        direction: 'y',
        x: rightNode.offset.x + rightNode.boundary.axisX,
        y: rightNode.offset.y + rightNode.boundary.height,
        length: containerBoundary.height - (rightNode.offset.y + rightNode.boundary.height),
      },
      {
        id: `edge/${rightNode.id}/right/border.bottom->axis`,
        direction: 'x',
        x: containerBoundary.axisX,
        y: containerBoundary.height,
        length: rightNode.offset.x + rightNode.boundary.axisX - containerBoundary.axisX,
      }
    );
  } else {
    edgeList.push(
      {
        id: `edge/${choiceNode.id}/right/choice->border.right`,
        direction: 'x',
        x: choiceNode.offset.x + choiceNode.boundary.width,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: containerBoundary.width - (choiceNode.offset.x + choiceNode.boundary.width),
      },
      {
        id: `edge/${choiceNode.id}/right/border.top->border.bottom`,
        direction: 'y',
        x: containerBoundary.width,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: containerBoundary.height - (choiceNode.offset.y + choiceNode.boundary.axisY),
      },
      {
        id: `edge/${choiceNode.id}/right/border.bottom->out`,
        direction: 'x',
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
        direction: 'y',
        x: containerBoundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.height,
        length: BranchIntervalY,
        text: leftNodeText,
      },
      {
        id: `edge/${leftNode.id}/left/else->out`,
        direction: 'y',
        x: containerBoundary.axisX,
        y: leftNode.offset.y + leftNode.boundary.height,
        length: containerBoundary.height - (leftNode.offset.y + leftNode.boundary.height),
      }
    );
  } else {
    edgeList.push({
      id: `edge/${choiceNode.id}/left/choice->out`,
      x: containerBoundary.axisX,
      y: choiceNode.offset.y + choiceNode.boundary.height,
      length: containerBoundary.height - (choiceNode.offset.y + choiceNode.boundary.height),
      text: leftNodeText,
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
  };
}
