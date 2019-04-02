import { IndexedNode } from '../models/IndexedNode';
import { NodeTypes } from '../constants/NodeTypes';
import { mergeNodesIntoEdges } from '../helpers/mergeNodesIntoEdges';
import { buildObiStep } from '../helpers/elementBuilder';

/**
 *      Step                     Rule              ^
 *        |                       |           <Recognizer>
 *      Step —— Step             Rule              V
 *        |      |                |
 *      Step —— Step             Rule
 *        |
 *      Step
 */
export const SequentialStrategy = {
  selectNodes: input => {
    let steps = [];
    let rules = [];
    let recognizers = [];

    // TODO: parse steps
    if (Array.isArray(input.steps)) {
      steps = input.steps.map(
        (step, index) => new IndexedNode(`$.steps[${index}]`, NodeTypes.Process, buildObiStep(step))
      );
    }

    if (Array.isArray(input.rules)) {
      rules = input.rules.map((rule, index) => new IndexedNode(`$.rules[${index}]`, NodeTypes.Process, rule));
    }

    if (input.recognizer) {
      recognizers = [new IndexedNode(`$.recognizer`, NodeTypes.Decision, input.recognizer)];
    }

    return {
      steps,
      rules,
      recognizers,
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
