export function consumeStrategy(input, transformer) {
  const { selectNodes, buildEdges, output } = transformer;
  const nodes = selectNodes(input);
  const edges = buildEdges(nodes);
  return output(nodes, edges);
}
