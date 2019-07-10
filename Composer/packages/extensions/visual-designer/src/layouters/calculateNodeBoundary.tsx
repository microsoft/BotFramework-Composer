import { Boundary } from '../shared/Boundary';
import { ElementInterval, LoopEdgeMarginLeft } from '../shared/elementSizes';

const BranchIntervalX = ElementInterval.x;
const BranchIntervalY = ElementInterval.y / 2;

export function calculateSequenceBoundary(
  boundaries: Boundary[],
  widthHeadEdge = true,
  widthTailEdge = true
): Boundary {
  const box = new Boundary();
  if (!Array.isArray(boundaries) || boundaries.length === 0) {
    return box;
  }

  box.axisX = Math.max(0, ...boundaries.map(x => x.axisX));
  box.width = box.axisX + Math.max(0, ...boundaries.map(x => x.width - x.axisX));
  box.height =
    boundaries.map(x => x.height).reduce((sum, val) => sum + val, 0) +
    ElementInterval.y * Math.max(boundaries.length - 1, 0);

  if (widthHeadEdge) box.height += ElementInterval.y / 2;
  if (widthTailEdge) box.height += ElementInterval.y / 2;
  return box;
}

export function calculateForeachBoundary(
  foreachBoundary: Boundary,
  stepsBoundary: Boundary,
  loopBeginBoundary: Boundary,
  loopEndBoundary: Boundary
): Boundary {
  const box = new Boundary();

  if (!foreachBoundary || !stepsBoundary) return box;

  box.axisX = Math.max(foreachBoundary.axisX, stepsBoundary.axisX) + LoopEdgeMarginLeft;
  box.width =
    box.axisX + Math.max(foreachBoundary.width - box.axisX, stepsBoundary.width - box.axisX) + LoopEdgeMarginLeft;
  box.height =
    foreachBoundary.height +
    BranchIntervalY +
    loopBeginBoundary.height +
    BranchIntervalY +
    stepsBoundary.height +
    BranchIntervalY +
    loopEndBoundary.height;

  return box;
}

export function calculateIfElseBoundary(
  conditionBoundary: Boundary,
  choiceBoundary: Boundary,
  ifBoundary: Boundary,
  elseBoundary: Boundary
): Boundary {
  if (!conditionBoundary || !choiceBoundary) return new Boundary();

  const branchBoundaries: Boundary[] = [ifBoundary || new Boundary(), elseBoundary || new Boundary()];

  return measureBranchingContainerBoundary(conditionBoundary, choiceBoundary, branchBoundaries);
}

export function calculateSwitchCaseBoundary(
  conditionBoundary: Boundary,
  choiceBoundary: Boundary,
  branchBoundaries: Boundary[] = []
): Boundary {
  if (!conditionBoundary || !choiceBoundary) return new Boundary();

  return measureBranchingContainerBoundary(conditionBoundary, choiceBoundary, branchBoundaries);
}

function measureBranchingContainerBoundary(
  conditionBoundary: Boundary,
  choiceBoundary: Boundary,
  branchBoundaries: Boundary[] = []
): Boundary {
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
