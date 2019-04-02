import { IndexedNode } from '../models/IndexedNode';
import { NodeTypes } from '../constants/NodeTypes';
import { mergeNodesIntoEdges } from '../helpers/mergeNodesIntoEdges';
import { buildObiStep } from '../helpers/elementBuilder';

/**
 *      Step            Rule
 *        |              |
 *      Step            Rule
 *        |
 *      Step
 */
export const SequentialStrategy = {
  selectNodes: input => {
    let steps = [];
    let rules = [];

    if (Array.isArray(input.steps)) {
      steps = input.steps.map(
        (step, index) => new IndexedNode(`$.steps[${index}]`, NodeTypes.Process, buildObiStep(step))
      );
    }

    if (Array.isArray(input.rules)) {
      rules = input.rules.map((rule, index) => new IndexedNode(`$.rules[${index}]`, NodeTypes.Process, rule));
    }

    return {
      steps,
      rules,
    };
  },
  buildEdges: nodeCollection => {
    const edges = [];

    const { steps, rules } = nodeCollection;
    for (const arr of [steps, rules]) {
      for (let i = 0; i < arr.length - 1; i++) {
        edges.push({
          from: arr[i].id,
          to: arr[i + 1].id,
        });
      }
    }
    return edges;
  },
  output: (nodeCollection, edges) => {
    const nodes = [].concat(...Object.values(nodeCollection));
    return mergeNodesIntoEdges(nodes, edges);
  },
};
