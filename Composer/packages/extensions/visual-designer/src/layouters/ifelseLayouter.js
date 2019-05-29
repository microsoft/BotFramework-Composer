import { Boundary } from '../components/shared/Boundary';
import { ElementInterval } from '../shared/elementSizes';

const BranchIntervalX = ElementInterval.x;
const BranchIntervalY = ElementInterval.y / 2;

export function ifElseLayouter(choiceNode, ifNode, elseNode) {
  const containerBoundary = new Boundary();
  if (!choiceNode) return { boundary: containerBoundary };

  const { width: ifWidth, height: ifHeight } = ifNode ? ifNode.boundary : new Boundary();
  const { width: elseWith, height: elseHeight } = elseNode ? elseNode.boundary : new Boundary();

  const flag = (ifNode ? '1' : '0') + (elseNode ? '1' : '0');
  switch (flag) {
    case '11':
      /**
       *      <Choice>  --------
       *          |            |
       *        [else]        [if]
       *          |-------------
       */
      containerBoundary.axisX = Math.max(choiceNode.boundary.axisX, elseNode.boundary.axisX);
      containerBoundary.width =
        containerBoundary.axisX +
        Math.max(
          elseNode.boundary.width - elseNode.boundary.axisX,
          choiceNode.boundary.width - choiceNode.boundary.axisX
        ) +
        BranchIntervalX +
        ifWidth;
      containerBoundary.height = Math.max(
        choiceNode.boundary.height + BranchIntervalY + elseHeight + BranchIntervalY,
        choiceNode.boundary.axisY + BranchIntervalY + ifHeight + BranchIntervalY
      );

      choiceNode.offset = {
        x: containerBoundary.axisX - choiceNode.boundary.axisX,
        y: 0,
      };
      elseNode.offset = {
        x: containerBoundary.axisX - elseNode.boundary.axisX,
        y: choiceNode.boundary.height + BranchIntervalY,
      };
      ifNode.offset = {
        x: Math.max(choiceNode.boundary.width, elseWith) + BranchIntervalX,
        y: choiceNode.boundary.axisY + BranchIntervalY,
      };
      break;
    case '10':
      /**
       *      <Choice>------
       *         |        [if]
       *         |         |
       *         |----------
       */
      ifNode.offset = {
        x: choiceNode.boundary.width + BranchIntervalX,
        y: choiceNode.boundary.axisY + BranchIntervalY,
      };
      containerBoundary.width = ifNode.offset.x + ifWidth;
      containerBoundary.height = Math.max(choiceNode.boundary.height, ifNode.offset.y + ifHeight) + BranchIntervalY;
      containerBoundary.axisX = choiceNode.boundary.axisX;

      choiceNode.offset = { x: 0, y: 0 };
      break;
    case '01':
      /**
       *      <Choice> ----
       *          |       |
       *        [else]    |
       *          |--------
       */
      containerBoundary.width = Math.max(choiceNode.boundary.width, elseWith) + BranchIntervalX;
      containerBoundary.height = choiceNode.boundary.height + elseHeight + BranchIntervalY * 2;
      containerBoundary.axisX = Math.max(choiceNode.boundary.axisX, elseNode.boundary.axisX);

      choiceNode.offset = {
        x: containerBoundary.axisX - choiceNode.boundary.axisX,
        y: 0,
      };
      elseNode.offset = {
        x: containerBoundary.axisX - elseNode.boundary.axisX,
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
  if (ifNode) {
    edgeList.push(
      {
        id: `edge/${ifNode.id}/if/choice->top}`,
        direction: 'x',
        x: choiceNode.offset.x + choiceNode.boundary.width,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: ifNode.offset.x + ifNode.boundary.axisX - choiceNode.boundary.width - choiceNode.offset.x,
        text: 'Y',
      },
      {
        id: `edge/${ifNode.id}/if/top->if}`,
        direction: 'y',
        x: ifNode.offset.x + ifNode.boundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: BranchIntervalY,
      },
      {
        id: `edge/${ifNode.id}/if/if->border.bottom`,
        direction: 'y',
        x: ifNode.offset.x + ifNode.boundary.axisX,
        y: ifNode.offset.y + ifNode.boundary.height,
        length: containerBoundary.height - (ifNode.offset.y + ifNode.boundary.height),
      },
      {
        id: `edge/${ifNode.id}/if/border.bottom->out`,
        direction: 'x',
        x: containerBoundary.axisX,
        y: containerBoundary.height,
        length: ifNode.offset.x + ifNode.boundary.axisX - containerBoundary.axisX,
      }
    );
  } else {
    edgeList.push(
      {
        id: `edge/${choiceNode.id}/if/choice->border.right`,
        direction: 'x',
        x: choiceNode.offset.x + choiceNode.boundary.width,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: containerBoundary.width - (choiceNode.offset.x + choiceNode.boundary.width),
      },
      {
        id: `edge/${choiceNode.id}/if/border.top->border.bottom`,
        direction: 'y',
        x: containerBoundary.width,
        y: choiceNode.offset.y + choiceNode.boundary.axisY,
        length: containerBoundary.height - (choiceNode.offset.y + choiceNode.boundary.axisY),
      },
      {
        id: `edge/${choiceNode.id}/if/border.bottom->out`,
        direction: 'x',
        x: containerBoundary.axisX,
        y: containerBoundary.height,
        length: containerBoundary.width - containerBoundary.axisX,
      }
    );
  }

  if (elseNode) {
    edgeList.push(
      {
        id: `edge/${elseNode.id}/else/choice->else`,
        direction: 'y',
        x: containerBoundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.height,
        length: BranchIntervalY,
        text: 'N',
      },
      {
        id: `edge/${elseNode.id}/else/else->out`,
        direction: 'y',
        x: containerBoundary.axisX,
        y: elseNode.offset.y + elseNode.boundary.height,
        length: containerBoundary.height - (elseNode.offset.y + elseNode.boundary.height),
      }
    );
  } else {
    edgeList.push({
      id: `edge/${choiceNode.id}/else/choice->out`,
      x: containerBoundary.axisX,
      y: choiceNode.offset.y + choiceNode.boundary.height,
      length: containerBoundary.height - (choiceNode.offset.y + choiceNode.boundary.height),
      text: 'N',
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
