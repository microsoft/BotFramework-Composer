// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { BranchIntervalX, BranchAxisXIntervalMin } from '../constants/ElementSizes';
/**
 * Inputs two adjacent branch nodes, output their minimum interval x which satisfies two requirements:
 * 1. distance from leftNode's right broder to rightNode's left border >= ${BranchIntervalX}
 * 2. distance from leftNode's axis X to rightNode's axis X >= ${BranchAxisXIntervalMin}
 */
export var calculateBranchNodesIntervalX = function (leftNodeBound, rightNodeBound) {
  if (!rightNodeBound) return 0;
  return Math.max(
    BranchIntervalX,
    BranchAxisXIntervalMin - getRightWidth(leftNodeBound) - getLeftWidth(rightNodeBound)
  );
};
export var getLeftWidth = function (bound) {
  return bound ? bound.axisX : 0;
};
export var getRightWidth = function (bound) {
  return bound ? bound.width - bound.axisX : 0;
};
//# sourceMappingURL=sharedLayouterUtils.js.map
