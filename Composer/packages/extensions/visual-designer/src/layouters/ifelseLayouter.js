import { Boundary } from '../components/shared/Boundary';

const BranchIntervalX = 50;
const BranchIntervalY = 30;

export function ifElseLayouter(choiceBoundary, ifBoundary, elseBoundary) {
  const containerBoundary = new Boundary();
  const { width: ifWidth, height: ifHeight } = ifBoundary ? ifBoundary.boundary : new Boundary();
  const { width: elseWith, height: elseHeight } = elseBoundary ? elseBoundary.boundary : new Boundary();

  const flag = (ifBoundary ? '1' : '0') + (elseBoundary ? '1' : '0');
  switch (flag) {
    case '11':
      /**
       *      <Choice>  ----- [if]
       *          |            |
       *        [else]         |
       *          |-------------
       */
      containerBoundary.axisX = Math.max(choiceBoundary.boundary.axisX, elseBoundary.boundary.axisX);
      containerBoundary.width =
        containerBoundary.axisX +
        Math.max(
          elseBoundary.boundary.width - elseBoundary.boundary.axisX,
          choiceBoundary.boundary.width - choiceBoundary.boundary.axisX
        ) +
        BranchIntervalX +
        ifWidth;
      containerBoundary.height = Math.max(
        choiceBoundary.boundary.height + 2 * BranchIntervalY + elseHeight,
        ifHeight + BranchIntervalY
      );

      choiceBoundary.offset = {
        x: containerBoundary.axisX - choiceBoundary.boundary.axisX,
        y: 0,
      };
      elseBoundary.offset = {
        x: containerBoundary.axisX - elseBoundary.boundary.axisX,
        y: choiceBoundary.boundary.height + BranchIntervalY,
      };
      ifBoundary.offset = { x: Math.max(choiceBoundary.boundary.width, elseWith) + BranchIntervalX, y: 0 };
      break;
    case '10':
      /**
       *      <Choice>----[if]
       *         |         |
       *         |         |
       *         |----------
       */
      containerBoundary.width = choiceBoundary.boundary.width + BranchIntervalX + ifWidth;
      containerBoundary.height = Math.max(choiceBoundary.boundary.height, ifHeight) + BranchIntervalY;
      containerBoundary.axisX = choiceBoundary.boundary.axisX;

      choiceBoundary.offset = { x: 0, y: 0 };
      ifBoundary.offset = { x: choiceBoundary.boundary.width + BranchIntervalX, y: 0 };
      break;
    case '01':
      /**
       *      <Choice> ----
       *          |       |
       *        [else]    |
       *          |--------
       */
      containerBoundary.width = Math.max(choiceBoundary.boundary.width, elseWith) + BranchIntervalX;
      containerBoundary.height = choiceBoundary.boundary.height + elseHeight + BranchIntervalY * 2;
      containerBoundary.axisX = Math.max(choiceBoundary.boundary.axisX, elseBoundary.boundary.axisX);

      choiceBoundary.offset = {
        x: containerBoundary.axisX - choiceBoundary.boundary.axisX,
        y: 0,
      };
      elseBoundary.offset = {
        x: containerBoundary.axisX - elseBoundary.boundary.axisX,
        y: choiceBoundary.boundary.height + BranchIntervalY,
      };
      break;
    case '00':
      /**
       *    <Choice>
       */
      containerBoundary.width = choiceBoundary.boundary.width;
      containerBoundary.height = choiceBoundary.boundary.height;
      containerBoundary.axisX = choiceBoundary.boundary.axisX;
      choiceBoundary.offset = { x: 0, y: 0 };
      break;
    default:
      break;
  }

  const edgeList = [];
  if (ifBoundary) {
    edgeList.push(
      {
        key: `edge/${ifBoundary.id}/if/choice->if}`,
        direction: 'x',
        x: choiceBoundary.offset.x + choiceBoundary.boundary.width,
        y: choiceBoundary.offset.y + choiceBoundary.boundary.axisY,
        length: ifBoundary.offset.x - choiceBoundary.boundary.width - choiceBoundary.offset.x,
        text: 'Y',
      },
      {
        key: `edge/${ifBoundary.id}/if/if->border.bottom`,
        direction: 'y',
        x: ifBoundary.offset.x + ifBoundary.boundary.axisX,
        y: ifBoundary.offset.y + ifBoundary.boundary.height,
        length: containerBoundary.height - (ifBoundary.offset.y + ifBoundary.boundary.height),
      },
      {
        key: `edge/${ifBoundary.id}/if/border.bottom->out`,
        direction: 'x',
        x: containerBoundary.axisX,
        y: containerBoundary.height,
        length: ifBoundary.offset.x + ifBoundary.boundary.axisX - containerBoundary.axisX,
      }
    );
  } else {
    edgeList.push(
      {
        key: `edge/${choiceBoundary.id}/if/choice->border.right`,
        direction: 'x',
        x: choiceBoundary.offset.x + choiceBoundary.boundary.width,
        y: choiceBoundary.offset.y + choiceBoundary.boundary.axisY,
        length: containerBoundary.width - (choiceBoundary.offset.x + choiceBoundary.boundary.width),
      },
      {
        key: `edge/${choiceBoundary.id}/if/border.top->border.bottom`,
        direction: 'y',
        x: containerBoundary.width,
        y: choiceBoundary.offset.y + choiceBoundary.boundary.axisY,
        length: containerBoundary.height - (choiceBoundary.offset.y + choiceBoundary.boundary.axisY),
      },
      {
        key: `edge/${choiceBoundary.id}/if/border.bottom->out`,
        direction: 'x',
        x: containerBoundary.axisX,
        y: containerBoundary.height,
        length: containerBoundary.width - containerBoundary.axisX,
      }
    );
  }

  if (elseBoundary) {
    edgeList.push(
      {
        key: `edge/${elseBoundary.id}/else/choice->else`,
        direction: 'y',
        x: containerBoundary.axisX,
        y: choiceBoundary.offset.y + choiceBoundary.boundary.height,
        length: BranchIntervalY,
        text: 'N',
      },
      {
        key: `edge/${elseBoundary.id}/else/else->out`,
        direction: 'y',
        x: containerBoundary.axisX,
        y: elseBoundary.offset.y + elseBoundary.boundary.height,
        length: BranchIntervalY,
      }
    );
  } else {
    edgeList.push({
      key: `edge/${choiceBoundary.id}/else/choice->out`,
      x: containerBoundary.axisX,
      y: choiceBoundary.offset.y + choiceBoundary.boundary.height,
      length: containerBoundary.height - (choiceBoundary.offset.y + choiceBoundary.boundary.height),
      text: 'N',
    });
  }

  return {
    boundary: containerBoundary,
    nodeMap: {
      choice: choiceBoundary,
      if: ifBoundary,
      else: elseBoundary,
    },
    edges: edgeList,
  };
}
