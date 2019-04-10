export function consumeStrategy(input, transformer) {
  const { selectNodes, buildEdges, middlewares, output } = transformer;
  let nodes = selectNodes(input);
  let edges = buildEdges(nodes);
  if (Array.isArray(middlewares) && middlewares.length) {
    let result = { nodeCollection: nodes, edges };
    for (const f of middlewares) {
      result = f(result);
    }
    nodes = result.nodeCollection;
    edges = result.edges;
  }
  return output(nodes, edges);
}
