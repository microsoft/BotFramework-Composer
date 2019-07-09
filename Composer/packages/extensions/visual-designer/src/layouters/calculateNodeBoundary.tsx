import { Boundary } from '../shared/Boundary';
import { GraphNode } from '../shared/GraphNode';
import { ElementInterval, LoopEdgeMarginLeft } from '../shared/elementSizes';
import { GraphBox } from '../logicflow/models/GraphBox';

const BranchIntervalX = ElementInterval.x;
const BranchIntervalY = ElementInterval.y / 2;

export function calculateSequenceBoundary(nodes: GraphBox[], widthHeadEdge = true, widthTailEdge = true) {
  const box = new Boundary();
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return box;
  }

  box.axisX = Math.max(0, ...nodes.map(x => x.boundary.axisX));
  box.width = box.axisX + Math.max(0, ...nodes.map(x => x.boundary.width - x.boundary.axisX));
  box.height =
    nodes.map(x => x.boundary.height).reduce((sum, val) => sum + val, 0) +
    ElementInterval.y * Math.max(nodes.length - 1, 0);

  if (widthHeadEdge) box.height += ElementInterval.y / 2;
  if (widthTailEdge) box.height += ElementInterval.y / 2;
  return box;
}

export function calculateForeachBoundary(
  foreachNode: GraphBox,
  stepsNode: GraphBox,
  loopBeginNode: GraphBox,
  loopEndNode: GraphBox
) {
  const box = new Boundary();

  if (!foreachNode || !stepsNode) return box;

  box.axisX = Math.max(foreachNode.boundary.axisX, stepsNode.boundary.axisX) + LoopEdgeMarginLeft;
  box.width =
    box.axisX +
    Math.max(foreachNode.boundary.width - box.axisX, stepsNode.boundary.width - box.axisX) +
    LoopEdgeMarginLeft;
  box.height =
    foreachNode.boundary.height +
    BranchIntervalY +
    loopBeginNode.boundary.height +
    BranchIntervalY +
    stepsNode.boundary.height +
    BranchIntervalY +
    loopEndNode.boundary.height;

  return box;
}

export function calculateIfElseBoundary(
  conditionNode: GraphBox,
  choiceNode: GraphBox,
  ifNode: GraphBox,
  elseNode: GraphBox
) {
  if (!conditionNode || !choiceNode) return new Boundary();

  const branchNodes: { [key: string]: any } = [ifNode || new GraphNode(), elseNode || new GraphNode()];

  return measureBranchingContainerBoundary(
    conditionNode.boundary,
    choiceNode.boundary,
    branchNodes.map(x => x.boundary)
  );
}

export function calculateSwitchCaseBoundary(
  conditionNode: GraphBox,
  choiceNode: GraphBox,
  branchNodes: GraphBox[] = []
) {
  if (!conditionNode || !choiceNode) return new Boundary();

  return measureBranchingContainerBoundary(
    conditionNode.boundary,
    choiceNode.boundary,
    branchNodes.map(x => x.boundary)
  );
}

function measureBranchingContainerBoundary(
  conditionBoundary: Boundary,
  choiceBoundary: Boundary,
  branchBoundaries: Boundary[] = []
) {
  if (!conditionBoundary || !choiceBoundary) return new Boundary();

  const firstBranchBoundary = branchBoundaries[0] || new Boundary();

  const branchGroupBoundary = new Boundary();
  branchGroupBoundary.width = branchBoundaries.reduce((acc, x) => acc + x.width + BranchIntervalX, 0);
  branchGroupBoundary.height = Math.max(...branchBoundaries.map(x => x.height));
  branchGroupBoundary.axisX = firstBranchBoundary.axisX;

  /** Calculate boundary */
  const containerAxisX = Math.max(conditionBoundary.axisX, choiceBoundary.axisX, branchGroupBoundary.axisX);
  const containerHeight =
    conditionBoundary.height +
    BranchIntervalY +
    choiceBoundary.height +
    BranchIntervalY +
    branchGroupBoundary.height +
    BranchIntervalY;
  const containerWidth =
    containerAxisX +
    Math.max(
      conditionBoundary.width - conditionBoundary.axisX,
      choiceBoundary.width - choiceBoundary.axisX,
      branchGroupBoundary.width - branchGroupBoundary.axisX
    );

  const containerBoundary = new Boundary();
  containerBoundary.width = containerWidth;
  containerBoundary.height = containerHeight;
  containerBoundary.axisX = containerAxisX;
  return containerBoundary;
}
