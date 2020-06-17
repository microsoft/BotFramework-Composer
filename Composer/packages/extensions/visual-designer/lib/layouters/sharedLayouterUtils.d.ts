import { Boundary } from '../models/Boundary';
/**
 * Inputs two adjacent branch nodes, output their minimum interval x which satisfies two requirements:
 * 1. distance from leftNode's right broder to rightNode's left border >= ${BranchIntervalX}
 * 2. distance from leftNode's axis X to rightNode's axis X >= ${BranchAxisXIntervalMin}
 */
export declare const calculateBranchNodesIntervalX: (
  leftNodeBound: Boundary,
  rightNodeBound?: Boundary | undefined
) => number;
export declare const getLeftWidth: (bound?: Boundary | undefined) => number;
export declare const getRightWidth: (bound?: Boundary | undefined) => number;
//# sourceMappingURL=sharedLayouterUtils.d.ts.map
