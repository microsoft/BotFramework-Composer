export function applyTransformer(input, transformer) {
  const { when, selectNodes, buildEdges, output } = transformer;

  if (when(input)) {
    const nodes = selectNodes(input);
    const edges = buildEdges(nodes);
    return output(nodes, edges);
  }
  return null;
}
