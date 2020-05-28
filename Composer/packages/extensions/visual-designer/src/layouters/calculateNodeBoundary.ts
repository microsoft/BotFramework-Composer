// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Boundary } from '../models/Boundary';
import {
  ElementInterval,
  BranchIntervalX,
  BranchIntervalY,
  LoopEdgeMarginLeft,
  DiamondSize,
  IconBrickSize,
  BoxMargin,
} from '../constants/ElementSizes';

import { calculateBranchNodesIntervalX } from './sharedLayouterUtils';

export function calculateSequenceBoundary(
  boundaries: Boundary[],
  widthHeadEdge = true,
  widthTailEdge = true
): Boundary {
  const box = new Boundary();
  if (!Array.isArray(boundaries) || boundaries.length === 0) {
    return box;
  }

  box.axisX = Math.max(0, ...boundaries.map((x) => x.axisX));
  box.width = box.axisX + Math.max(0, ...boundaries.map((x) => x.width - x.axisX));
  box.height =
    boundaries.map((x) => x.height).reduce((sum, val) => sum + val, 0) +
    ElementInterval.y * Math.max(boundaries.length - 1, 0);

  if (widthHeadEdge) box.height += ElementInterval.y / 2;
  if (widthTailEdge) box.height += ElementInterval.y / 2;
  return box;
}

export function calculateForeachBoundary(
  foreachBoundary: Boundary | null,
  stepsBoundary: Boundary | null,
  loopBeginBoundary: Boundary,
  loopEndBoundary: Boundary
): Boundary {
  const box = new Boundary();

  if (!foreachBoundary || !stepsBoundary) return box;

  box.axisX = Math.max(foreachBoundary.axisX, stepsBoundary.axisX) + LoopEdgeMarginLeft;
  box.width = Math.max(foreachBoundary.width, stepsBoundary.width) + LoopEdgeMarginLeft;
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
  conditionBoundary: Boundary | null,
  choiceBoundary: Boundary | null,
  ifBoundary: Boundary,
  elseBoundary: Boundary
): Boundary {
  if (!conditionBoundary || !choiceBoundary) return new Boundary();

  const branchBoundaries: Boundary[] = [ifBoundary || new Boundary(), elseBoundary || new Boundary()];

  return measureBranchingContainerBoundary(conditionBoundary, choiceBoundary, branchBoundaries);
}

export function calculateSwitchCaseBoundary(
  conditionBoundary: Boundary | null,
  choiceBoundary: Boundary | null,
  branchBoundaries: Boundary[] = []
): Boundary {
  if (!conditionBoundary || !choiceBoundary) return new Boundary();

  return measureBranchingContainerBoundary(conditionBoundary, choiceBoundary, branchBoundaries);
}

function measureBranchingContainerBoundary(
  conditionBoundary: Boundary | null,
  choiceBoundary: Boundary | null,
  branchBoundaries: Boundary[] = []
): Boundary {
  if (!conditionBoundary || !choiceBoundary) return new Boundary();

  const firstBranchBoundary = branchBoundaries[0] || new Boundary();

  const branchGroupBoundary = new Boundary();
  branchGroupBoundary.width = branchBoundaries.reduce((acc, x, currentIndex) => {
    return acc + x.width + calculateBranchNodesIntervalX(x, branchBoundaries[currentIndex + 1]);
  }, 0);
  branchGroupBoundary.height = Math.max(...branchBoundaries.map((x) => x.height));
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

export function calculateBaseInputBoundary(botAsksBoundary: Boundary, userAnswersBoundary: Boundary): Boundary {
  const boundary = new Boundary();

  boundary.axisX = Math.max(botAsksBoundary.axisX, userAnswersBoundary.axisX);
  boundary.width =
    boundary.axisX +
    Math.max(
      botAsksBoundary.width - botAsksBoundary.axisX,
      userAnswersBoundary.width - userAnswersBoundary.axisX + IconBrickSize.width + LoopEdgeMarginLeft + BoxMargin
    );
  boundary.height = botAsksBoundary.height + ElementInterval.y + userAnswersBoundary.height + ElementInterval.y / 2;

  return boundary;
}

export function calculateTextInputBoundary(nodeBoundary: Boundary): Boundary {
  const boundary = new Boundary();

  boundary.axisX = nodeBoundary.axisX;
  boundary.height =
    nodeBoundary.height + // [Text Input]
    2 * BranchIntervalY + //      |
    nodeBoundary.height + //  [property]
    BranchIntervalY + //      |
    DiamondSize.height + //     < >
    BranchIntervalY + //      |
    DiamondSize.height; //     < >
  boundary.width = 3 * nodeBoundary.width + 3 * BranchIntervalX;

  return boundary;
}
