import { Boundary } from '../components/shared/Boundary';
import { GraphNode } from '../components/shared/GraphNode';
import { ElementInterval } from '../shared/elementSizes';

const BranchIntervalX = ElementInterval.x;
const BranchIntervalY = ElementInterval.y / 2;

export function measureIfElseBoundary(conditionNode, choiceNode, ifNode, elseNode) {
  if (!conditionNode || !choiceNode) return new Boundary();

  const leftNode = ifNode || new GraphNode();
  const rightNode = elseNode || new GraphNode();

  return measureBranchingNodeBoundary(conditionNode, choiceNode, [leftNode, rightNode]);
}

export function measureSwitchCaseBoundary(conditionNode, choiceNode, defaultNode, caseNodes = []) {
  if (!conditionNode || !choiceNode) return new Boundary();

  const branchNodes = [defaultNode, ...caseNodes].map(x => x || new GraphNode());

  return measureBranchingNodeBoundary(conditionNode, choiceNode, branchNodes);
}

export function measureBranchingNodeBoundary(conditionNode, choiceNode, branchNodes = []) {
  if (!conditionNode || !choiceNode) return new Boundary();

  const firstBranchNode = branchNodes[0] || new GraphNode();

  const branchGroupBoundary = new Boundary();
  branchGroupBoundary.width = branchNodes.reduce((acc, x) => acc + x.boundary.width + BranchIntervalX, 0);
  branchGroupBoundary.height = Math.max(...branchNodes.map(x => x.boundary.height));
  branchGroupBoundary.axisX = firstBranchNode.boundary.axisX;

  /** Calculate boundary */
  const containerAxisX = Math.max(conditionNode.boundary.axisX, choiceNode.boundary.axisX, branchGroupBoundary.axisX);
  const containerHeight =
    conditionNode.boundary.height +
    BranchIntervalY +
    choiceNode.boundary.height +
    BranchIntervalY +
    branchGroupBoundary.height +
    BranchIntervalY;
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
  return containerBoundary;
}
