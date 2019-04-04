import { ObiTypes } from '../constants/ObiTypes';
import { PAYLOAD_KEY } from '../../utils/constant';
import { IndexedNode } from '../models/IndexedNode';
import { NodeTypes } from '../constants/NodeTypes';

/**
 *           ...                           ...
 *            |                             |
 *       IfCondition     =>           <IfCondition>
 *            |                         /       \
 *        StepAfter                  Step(T)   Step(F)
 *                                     |         |
 *                                   Step(T)     |
 *                                      \        /
 *                                       \      /
 *                                       StepAfter
 */
export function branchMiddleware({ nodeCollection, edges }) {
  if (!Array.isArray(nodeCollection.steps) || !nodeCollection.steps.length) {
    return { nodeCollection, edges };
  }

  const globalNodes = { ...nodeCollection };
  const globalEdges = [...edges];

  const newNodes = [];

  let toBeProcessedNodes = [...globalNodes.steps];
  // The while loop's count equals to the number of nested level.
  while (Array.isArray(toBeProcessedNodes) && toBeProcessedNodes.length) {
    const ifConditionNodes = toBeProcessedNodes.filter(x => x[PAYLOAD_KEY].$type === ObiTypes.IfCondition);
    const newLevelNodes = [];
    ifConditionNodes.forEach(node => {
      const edgeIndexToFollower = globalEdges.findIndex(x => x.from === node.id);
      const followerId = edgeIndexToFollower > -1 ? globalEdges[edgeIndexToFollower].to : null;
      edgeIndexToFollower > -1 && globalEdges.splice(edgeIndexToFollower, 1);

      const subGraph = yieldSubgraph(node, ['ifTrue', 'ifFalse'], followerId);
      newLevelNodes.push(...subGraph.nodes);
      newNodes.push(...subGraph.nodes);
      globalEdges.push(...subGraph.edges);
    });
    toBeProcessedNodes = newLevelNodes;
  }

  if (Array.isArray(globalNodes.branches)) {
    globalNodes.branches.push(...newNodes);
  } else {
    globalNodes.branches = newNodes;
  }

  return {
    nodeCollection: globalNodes,
    edges: globalEdges,
  };
}

/**
 *    ...
 *     |
 *   [node]     =>    node ->    [node]         =>              ...
 *     |                          /  \                           |
 *  node_after               [child] [child]                   [node]
 *                              |      |                       /   \
 *                              o      o                   [child] [child]
 *                                                            |      |
 *                                                            o      o
 *                                                             \    /
 *                                                            node_after
 *
 * Generate a sub graph out of given node and connect it to the node's follower.
 * @param {object} node target node for building subgraph.
 * @param {string[]} branchKeys a list of string indicates 'children'.
 * @param {string} terminatorId all terminators in the result graph will be pointed to this id.
 */
function yieldSubgraph(node, branchKeys, terminatorId) {
  if (!Array.isArray(branchKeys) || !branchKeys.length) {
    return { nodes: [], edges: [] };
  }

  const resultNodes = [];
  const resultEdges = [];

  for (const branchKey of branchKeys) {
    const branchSteps = node[PAYLOAD_KEY][branchKey];
    const newEdges = [];
    const newNodes = [];

    if (Array.isArray(branchSteps) && branchSteps.length) {
      const branchNodes = branchSteps.map(
        (x, index) => new IndexedNode(`${node.id}.${branchKey}[${index}]`, NodeTypes.Process, x)
      );
      newNodes.push(...branchNodes);

      // Connect internal steps as a sequence.
      for (let i = 0; i < newNodes.length - 1; i++) {
        newEdges.push({ from: newNodes[i].id, to: newNodes[i + 1].id });
      }
      // Connect the subsequence to root node.
      newEdges.push({ from: node.id, to: newNodes[0].id, text: branchKey });
    }
    // Connect the sequence tail to root node's follower.
    if (terminatorId) {
      const tailId = newNodes.length ? newNodes[newNodes.length - 1].id : node.id;
      newEdges.push({ from: tailId, to: terminatorId });
    }

    // Merge new nodes and edges to results.
    resultNodes.push(...newNodes);
    resultEdges.push(...newEdges);
  }

  return {
    nodes: resultNodes,
    edges: resultEdges,
  };
}
