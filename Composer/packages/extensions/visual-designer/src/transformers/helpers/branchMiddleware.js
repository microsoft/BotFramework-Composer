import { ObiTypes } from '../constants/ObiTypes';
import { PAYLOAD_KEY } from '../../utils/constant';
import { IndexedNode } from '../models/IndexedNode';
import { NodeTypes } from '../constants/NodeTypes';

/**
 *           ...                           ...
 *            |                             |
 *       IfCondition     ->           <IfCondition>
 *            |                         /       \
 *        StepAfter                  Step(T)   Step(F)
 *                                     |         |
 *                                   Step(T)     |
 *                                      \        /
 *                                       \      /
 *                                       StepAfter
 */
export function ifElseMiddleware({ nodeCollection, edges }) {
  if (!Array.isArray(nodeCollection.steps) || !nodeCollection.steps.length) {
    return { nodeCollection, edges };
  }

  const globalNodes = { ...nodeCollection };
  const globalEdges = [...edges];

  let branchNodes = [];
  let branchEdges = [];

  const stepNodes = globalNodes.steps;
  const ifConditionNodes = stepNodes.filter(x => x[PAYLOAD_KEY].$type === ObiTypes.IfCondition);

  ifConditionNodes.forEach(node => {
    const edgeAfterIndex = globalEdges.findIndex(x => x.from === node.id);
    const nodeIdAfter = edgeAfterIndex > -1 ? globalEdges[edgeAfterIndex].to : null;

    const subGraph = yieldSubgraph(node, ['ifTrue', 'ifFalse'], nodeIdAfter);
    branchNodes = subGraph.nodes;
    branchEdges = subGraph.edges;
    globalEdges.splice(edgeAfterIndex, 1);
  });

  if (Array.isArray(globalNodes.branches)) {
    globalNodes.branches.push(...branchNodes);
  } else {
    globalNodes.branches = branchNodes;
  }

  globalEdges.push(...branchEdges);

  return {
    nodeCollection: globalNodes,
    edges: globalEdges,
  };
}

function yieldSubgraph(node, branchKeys, afterNodeId) {
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
    if (afterNodeId) {
      const tailId = newNodes.length ? newNodes[newNodes.length - 1].id : node.id;
      newEdges.push({ from: tailId, to: afterNodeId });
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
