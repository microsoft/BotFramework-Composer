import { Boundary } from '../components/shared/Boundary';
import { ElementInterval } from '../shared/elementSizes';
import { GraphNode } from '../components/shared/GraphNode';

const ConditionToSwitch = ElementInterval.y / 2;
const SwitchToBaseline = ElementInterval.y / 2;
const BaselineToBranch = ElementInterval.y / 2;
const BranchToBottom = ElementInterval.y / 2;
const BranchIntervalX = ElementInterval.x;

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

  const firstBranchNode = branchNodes[0] || new GraphNode();
  const lastBranchNode = branchNodes[branchNodes.length - 1] || new GraphNode();

  const branchGroupBoundary = new Boundary();
  branchGroupBoundary.width = branchNodes.reduce((acc, x) => acc + x.boundary.width + BranchIntervalX, 0);
  branchGroupBoundary.height = Math.max(...branchNodes.map(x => x.boundary.height)) + BaselineToBranch + BranchToBottom;
  branchGroupBoundary.axisX = firstBranchNode.boundary.axisX;

  /** Calculate boundary */
  const containerAxisX = Math.max(conditionNode.boundary.axisX, choiceNode.boundary.axisX, branchGroupBoundary.axisX);
  const containerHeight =
    conditionNode.boundary.height +
    ConditionToSwitch +
    choiceNode.boundary.height +
    SwitchToBaseline +
    branchGroupBoundary.height;
  const containerWidth =
    containerAxisX +
    Math.max(
      conditionNode.boundary.width - conditionNode.boundary.axisX,
      choiceNode.boundary.width - choiceNode.boundary.axisX,
      branchGroupBoundary.width - branchGroupBoundary.axisX
    );

  const containerBoundary = new Boundary();
  containerBoundary.width = containerWidth;
  containerBoundary.height = containerHeight;
  containerBoundary.axisX = containerAxisX;

  /** Calulate nodes position */
  conditionNode.offset = {
    x: containerAxisX - conditionNode.boundary.axisX,
    y: 0,
  };
  choiceNode.offset = {
    x: containerAxisX - choiceNode.boundary.axisX,
    y: conditionNode.offset.y + conditionNode.boundary.height + ConditionToSwitch,
  };

  const BaselinePositionY = choiceNode.offset.y + choiceNode.boundary.height + SwitchToBaseline;
  const BottomelinePositionY = containerHeight;

  branchNodes.reduce((accOffsetX, x) => {
    x.offset = {
      x: accOffsetX,
      y: BaselinePositionY + BaselineToBranch,
    };
    return accOffsetX + BranchIntervalX + x.boundary.width;
  }, containerAxisX - branchGroupBoundary.axisX);

  /** Calculate edges */
  const edges = [];
  edges.push(
    {
      id: `edge/${conditionNode.id}/switch/condition->switch`,
      direction: 'y',
      x: containerAxisX,
      y: conditionNode.offset.y + conditionNode.boundary.height,
      length: ConditionToSwitch,
    },
    {
      id: `edge/${choiceNode.id}/switch/switch->baseline`,
      direction: 'y',
      x: containerAxisX,
      y: choiceNode.offset.y + choiceNode.boundary.height,
      length: SwitchToBaseline,
    }
  );

  branchNodes.forEach(x => {
    edges.push(
      {
        id: `edge/${choiceNode.id}/case/baseline->${x.id}`,
        direction: 'y',
        x: x.offset.x + x.boundary.axisX,
        y: BaselinePositionY,
        length: BaselineToBranch,
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
    const baseLineLength = lastBranchNode.offset.x + lastBranchNode.boundary.axisX - containerAxisX;

    edges.push(
      {
        id: `edge/${conditionNode.id}/baseline`,
        direction: 'x',
        x: containerAxisX,
        y: BaselinePositionY,
        length: baseLineLength,
      },
      {
        id: `edge/${conditionNode.id}/bottomline`,
        direction: 'x',
        x: containerAxisX,
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
