import { GraphNode } from '../models/GraphNode';
import { GraphLayout } from '../models/GraphLayout';
/**
 *        [switch]
 *           |
 *           ------------
 *           |   |  |   |
 */
export declare function switchCaseLayouter(
  conditionNode: GraphNode | null,
  choiceNode: GraphNode,
  branchNodes?: GraphNode[]
): GraphLayout;
//# sourceMappingURL=switchCaseLayouter.d.ts.map
