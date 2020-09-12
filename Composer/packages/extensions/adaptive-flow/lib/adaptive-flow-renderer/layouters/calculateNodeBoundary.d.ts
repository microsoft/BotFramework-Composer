import { Boundary } from '../models/Boundary';
export declare function calculateSequenceBoundary(boundaries: Boundary[], widthHeadEdge?: boolean, widthTailEdge?: boolean): Boundary;
export declare function calculateForeachBoundary(foreachBoundary: Boundary | null, stepsBoundary: Boundary | null, loopBeginBoundary: Boundary, loopEndBoundary: Boundary): Boundary;
export declare function calculateIfElseBoundary(conditionBoundary: Boundary | null, choiceBoundary: Boundary | null, ifBoundary: Boundary, elseBoundary: Boundary): Boundary;
export declare function calculateSwitchCaseBoundary(conditionBoundary: Boundary | null, choiceBoundary: Boundary | null, branchBoundaries?: Boundary[]): Boundary;
export declare function calculateBaseInputBoundary(botAsksBoundary: Boundary, userAnswersBoundary: Boundary): Boundary;
export declare function calculateTextInputBoundary(nodeBoundary: Boundary): Boundary;
//# sourceMappingURL=calculateNodeBoundary.d.ts.map