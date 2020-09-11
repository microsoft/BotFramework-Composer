// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __spreadArrays } from "tslib";
import { Boundary } from '../models/Boundary';
import { ElementInterval, BranchIntervalX, BranchIntervalY, LoopEdgeMarginLeft, DiamondSize, IconBrickSize, BoxMargin, } from '../constants/ElementSizes';
import { calculateBranchNodesIntervalX } from './sharedLayouterUtils';
export function calculateSequenceBoundary(boundaries, widthHeadEdge, widthTailEdge) {
    if (widthHeadEdge === void 0) { widthHeadEdge = true; }
    if (widthTailEdge === void 0) { widthTailEdge = true; }
    var box = new Boundary();
    if (!Array.isArray(boundaries) || boundaries.length === 0) {
        return box;
    }
    box.axisX = Math.max.apply(Math, __spreadArrays([0], boundaries.map(function (x) { return x.axisX; })));
    box.width = box.axisX + Math.max.apply(Math, __spreadArrays([0], boundaries.map(function (x) { return x.width - x.axisX; })));
    box.height =
        boundaries.map(function (x) { return x.height; }).reduce(function (sum, val) { return sum + val; }, 0) +
            ElementInterval.y * Math.max(boundaries.length - 1, 0);
    if (widthHeadEdge)
        box.height += ElementInterval.y / 2;
    if (widthTailEdge)
        box.height += ElementInterval.y / 2;
    return box;
}
export function calculateForeachBoundary(foreachBoundary, stepsBoundary, loopBeginBoundary, loopEndBoundary) {
    var box = new Boundary();
    if (!foreachBoundary || !stepsBoundary)
        return box;
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
export function calculateIfElseBoundary(conditionBoundary, choiceBoundary, ifBoundary, elseBoundary) {
    if (!conditionBoundary || !choiceBoundary)
        return new Boundary();
    var branchBoundaries = [ifBoundary || new Boundary(), elseBoundary || new Boundary()];
    return measureBranchingContainerBoundary(conditionBoundary, choiceBoundary, branchBoundaries);
}
export function calculateSwitchCaseBoundary(conditionBoundary, choiceBoundary, branchBoundaries) {
    if (branchBoundaries === void 0) { branchBoundaries = []; }
    if (!conditionBoundary || !choiceBoundary)
        return new Boundary();
    return measureBranchingContainerBoundary(conditionBoundary, choiceBoundary, branchBoundaries);
}
function measureBranchingContainerBoundary(conditionBoundary, choiceBoundary, branchBoundaries) {
    if (branchBoundaries === void 0) { branchBoundaries = []; }
    if (!conditionBoundary || !choiceBoundary)
        return new Boundary();
    var firstBranchBoundary = branchBoundaries[0] || new Boundary();
    var branchGroupBoundary = new Boundary();
    branchGroupBoundary.width = branchBoundaries.reduce(function (acc, x, currentIndex) {
        return acc + x.width + calculateBranchNodesIntervalX(x, branchBoundaries[currentIndex + 1]);
    }, 0);
    branchGroupBoundary.height = Math.max.apply(Math, branchBoundaries.map(function (x) { return x.height; }));
    branchGroupBoundary.axisX = firstBranchBoundary.axisX;
    /** Calculate boundary */
    var containerAxisX = Math.max(conditionBoundary.axisX, choiceBoundary.axisX, branchGroupBoundary.axisX);
    var containerHeight = conditionBoundary.height +
        BranchIntervalY +
        choiceBoundary.height +
        BranchIntervalY +
        branchGroupBoundary.height +
        BranchIntervalY;
    var containerWidth = containerAxisX +
        Math.max(conditionBoundary.width - conditionBoundary.axisX, choiceBoundary.width - choiceBoundary.axisX, branchGroupBoundary.width - branchGroupBoundary.axisX);
    var containerBoundary = new Boundary();
    containerBoundary.width = containerWidth;
    containerBoundary.height = containerHeight;
    containerBoundary.axisX = containerAxisX;
    return containerBoundary;
}
export function calculateBaseInputBoundary(botAsksBoundary, userAnswersBoundary) {
    var boundary = new Boundary();
    boundary.axisX = Math.max(botAsksBoundary.axisX, userAnswersBoundary.axisX);
    boundary.width =
        boundary.axisX +
            Math.max(botAsksBoundary.width - botAsksBoundary.axisX, userAnswersBoundary.width - userAnswersBoundary.axisX + IconBrickSize.width + LoopEdgeMarginLeft + BoxMargin);
    boundary.height = botAsksBoundary.height + ElementInterval.y + userAnswersBoundary.height + ElementInterval.y / 2;
    return boundary;
}
export function calculateTextInputBoundary(nodeBoundary) {
    var boundary = new Boundary();
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
//# sourceMappingURL=calculateNodeBoundary.js.map