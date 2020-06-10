// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BranchIntervalX, BranchAxisXIntervalMin } from '../constants/ElementSizes';
import { Boundary } from '../models/Boundary';

/**
 * Inputs two adjacent branch nodes, output their minimum interval x which satisfies two requirements:
 * 1. distance from leftNode's right broder to rightNode's left border >= ${BranchIntervalX}
 * 2. distance from leftNode's axis X to rightNode's axis X >= ${BranchAxisXIntervalMin}
 */
export const calculateBranchNodesIntervalX = (leftNodeBound: Boundary, rightNodeBound?: Boundary) => {
  if (!rightNodeBound) return 0;

  return Math.max(
    BranchIntervalX,
    BranchAxisXIntervalMin - getRightWidth(leftNodeBound) - getLeftWidth(rightNodeBound)
  );
};

export const getLeftWidth = (bound?: Boundary): number => (bound ? bound.axisX : 0);

export const getRightWidth = (bound?: Boundary): number => (bound ? bound.width - bound.axisX : 0);
