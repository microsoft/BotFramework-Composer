import { Boundary } from '../components/shared/Boundary';
import { ElementInterval } from '../shared/elementSizes';

const BranchIntervalX = ElementInterval.x;
const BranchIntervalY = ElementInterval.y / 2;

export function ifElseLayouter(choiceNode, ifNode, elseNode) {
  const containerBoundary = new Boundary();
  if (!choiceNode) return { boundary: containerBoundary };

  const leftNode = ifNode;
  const rightNode = elseNode;

  const leftNodeSize = leftNode ? leftNode.boundary : new Boundary();
  const rightNodeSize = rightNode ? rightNode.boundary : new Boundary();

  const leftNodeText = 'True';
  const rightNodeText = 'False';

  const flag = (leftNode ? '1' : '0') + (rightNode ? '1' : '0');
  switch (flag) {
    case '11':
      /**
       *      <Choice>  --------
       *          |            |
       *        [left]        [right]
       *          |-------------
       */
      containerBoundary.axisX = Math.max(choiceNode.boundary.axisX, leftNode.boundary.axisX);
      containerBoundary.width =
        containerBoundary.axisX +
        Math.max(
          leftNode.boundary.width - leftNode.boundary.axisX,
          choiceNode.boundary.width - choiceNode.boundary.axisX
        ) +
        BranchIntervalX +
        rightNodeSize.width;
      containerBoundary.height = Math.max(
        choiceNode.boundary.height + BranchIntervalY + leftNodeSize.height + BranchIntervalY,
        choiceNode.boundary.axisY + BranchIntervalY + rightNodeSize.height + BranchIntervalY
      );

      choiceNode.offset = {
        x: containerBoundary.axisX - choiceNode.boundary.axisX,
        y: 0,
      };
      leftNode.offset = {
        x: containerBoundary.axisX - leftNode.boundary.axisX,
        y: choiceNode.boundary.height + BranchIntervalY,
      };
      rightNode.offset = {
        x: Math.max(choiceNode.boundary.width, leftNodeSize.width) + BranchIntervalX,
        y: choiceNode.boundary.axisY + BranchIntervalY,
      };
      break;
    case '01':
      /**
       *      <Choice>------
       *         |        [right]
       *         |         |
       *         |----------
       */
      rightNode.offset = {
        x: choiceNode.boundary.width + BranchIntervalX,
        y: choiceNode.boundary.axisY + BranchIntervalY,
      };
      containerBoundary.width = rightNode.offset.x + rightNodeSize.width;
      containerBoundary.height =
        Math.max(choiceNode.boundary.height, rightNode.offset.y + rightNodeSize.height) + BranchIntervalY;
      containerBoundary.axisX = choiceNode.boundary.axisX;

      choiceNode.offset = { x: 0, y: 0 };
      break;
    case '10':
      /**
       *      <Choice> ----
       *          |       |
       *        [left]    |
       *          |--------
       */
      containerBoundary.width = Math.max(choiceNode.boundary.width, leftNodeSize.width) + BranchIntervalX;
      containerBoundary.height = choiceNode.boundary.height + leftNodeSize.height + BranchIntervalY * 2;
      containerBoundary.axisX = Math.max(choiceNode.boundary.axisX, leftNode.boundary.axisX);

      choiceNode.offset = {
        x: containerBoundary.axisX - choiceNode.boundary.axisX,
        y: 0,
      };
      leftNode.offset = {
        x: containerBoundary.axisX - leftNode.boundary.axisX,
        y: choiceNode.boundary.height + BranchIntervalY,
      };
      break;
    case '00':
      /**
       *    <Choice>
       */
      containerBoundary.width = choiceNode.boundary.width;
      containerBoundary.height = choiceNode.boundary.height;
      containerBoundary.axisX = choiceNode.boundary.axisX;
      choiceNode.offset = { x: 0, y: 0 };
      break;
    default:
      break;
  }

  const edgeList = [];
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
        id: `edge/${rightNode.id}/right/top->if}`,
        direction: 'y',
        x: rightNode.offset.x + rightNode.boundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: BranchIntervalY,
      },
      {
        id: `edge/${rightNode.id}/right/if->border.bottom`,
        direction: 'y',
        x: rightNode.offset.x + rightNode.boundary.axisX,
        y: rightNode.offset.y + rightNode.boundary.height,
        length: containerBoundary.height - (rightNode.offset.y + rightNode.boundary.height),
      },
      {
        id: `edge/${rightNode.id}/right/border.bottom->out`,
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
      choice: choiceNode,
      if: ifNode,
      else: elseNode,
    },
    edges: edgeList,
  };
}
