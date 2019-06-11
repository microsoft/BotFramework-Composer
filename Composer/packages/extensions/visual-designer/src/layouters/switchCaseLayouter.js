import { Boundary } from '../components/shared/Boundary';
import { ElementInterval } from '../shared/elementSizes';

import { measureSwitchCaseBoundary } from './boundaryMeasurer';

const BranchIntervalX = ElementInterval.x;
const BranchIntervalY = ElementInterval.y / 2;

/**
 *        [switch]
 *           |
 *           ------------
 *           |   |  |   |
 */
export function switchCaseLayouter(conditionNode, choiceNode, branchNodes = []) {
  if (!conditionNode) {
    return { boundary: new Boundary() };
  }

  const containerBoundary = measureSwitchCaseBoundary(conditionNode, choiceNode, branchNodes);

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
    return accOffsetX + BranchIntervalX + x.boundary.width;
  }, containerBoundary.axisX - firstBranchNode.boundary.axisX);

  /** Calculate edges */
  const edges = [];
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
        length: BranchIntervalY,
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

  return {
    boundary: containerBoundary,
    nodeMap: { conditionNode, choiceNode, branchNodes },
    edges,
  };
}
