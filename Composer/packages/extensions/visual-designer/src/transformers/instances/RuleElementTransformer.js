import { IndexedNode } from '../helpers/IndexedNode';
import { NodeTypes } from '../constants/NodeTypes';
import { mergeNodesIntoEdges } from '../helpers/mergeNodesIntoEdges';

export const RuleElementTransformer = {
  when: input => input && input.$type && input.$type.match(/.+Rule$/),
  selectNodes: input => ({
    steps: input.steps
      ? input.steps.map((step, index) => new IndexedNode(`$.steps[${index}]`, NodeTypes.Process, step))
      : [],
    parents: [new IndexedNode('..', NodeTypes.Start, null)],
  }),
  buildEdges: nodeCollection => {
    const { steps, parents } = nodeCollection;
    const nodeList = [parents[0], ...steps];

    const edges = [];
    for (let i = 0; i < nodeList.length - 1; i++) {
      edges.push({
        from: nodeList[i].id,
        to: nodeList[i + 1].id,
      });
    }
    return edges;
  },
  output: (nodeCollection, edges) => {
    const nodes = [].concat(...Object.keys(nodeCollection));
    return mergeNodesIntoEdges(nodes, edges);
  },
};
