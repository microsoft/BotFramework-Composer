const CHILDREN_KEY = 'neighborIds';

/**
 * Merge nodes into edges, record all adjacent nodes' ids in node.neighborId[].
 * @param {Object[]} nodes A list of objects represents graph nodes which have unique 'id' field.
 * @param {Object[]} edges A list of objects represents graph edges.
 */
export function mergeNodesIntoEdges(nodes, edges) {
  const nodeById = nodes.reduce(
    (accumulated, currentNode) => ({
      ...accumulated,
      [currentNode.id]: {
        ...currentNode,
        [CHILDREN_KEY]: [],
      },
    }),
    {}
  );

  edges.forEach(edge => {
    const { from, to } = edge;
    nodeById[from].neighborIds.push(to);
  });
  return Object.values(nodeById);
}
