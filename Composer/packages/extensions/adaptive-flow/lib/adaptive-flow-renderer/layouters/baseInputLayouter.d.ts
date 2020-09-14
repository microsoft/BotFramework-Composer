import { GraphLayout } from '../models/GraphLayout';
import { GraphNode } from '../models/GraphNode';
/**
 *         |
 *     [Bot Asks]
 *         |-------------------
 *   [User Answers]    [invalidPrompt]
 *         |-------------------
 */
export declare function baseInputLayouter(botAsksNode: GraphNode, userAnswersNode: GraphNode, invalidPromptNode: GraphNode): GraphLayout;
//# sourceMappingURL=baseInputLayouter.d.ts.map