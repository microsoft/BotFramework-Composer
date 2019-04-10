import { ObiTypes } from '../constants/ObiTypes';
import { NodeTypes } from '../constants/NodeTypes';
import { IndexedNode } from '../models/IndexedNode';
import { mergeNodesIntoEdges } from '../helpers/mergeNodesIntoEdges';
import { PAYLOAD_KEY } from '../../utils/constant';
import { normalizeObiStep } from '../helpers/elementBuilder';

/**
 * A strategy contains two tasks:
 *  1. How to select nodes out of raw json.
 *  2. How to connect your nodes to a graph by following some implicit rules.
 * Useually, how we connect nodes together is determined by how we select nodes.
 * Therefore, instead of implemnting node selector and edge connector as standalone modules,
 * putting them together is a more straight forward approach.
 */

/**
 *          Welcome                       Step
 *            |                             |
 *        Recognizer?                     Step
 *      /     |     \                       |
 *   Rule   Rule  NoMatchRule             Step
 */
export const GraphicalStrategy = {
  selectNodes: input => {
    if (!input) return {};

    const { rules, steps, recognizer } = input;

    const recognizerNodes =
      typeof recognizer === 'object' && recognizer.$type
        ? [new IndexedNode(`$.recognizer`, NodeTypes.Decision, recognizer)]
        : [];
    const ruleNodes = rules ? rules.map((x, index) => new IndexedNode(`$.rules[${index}]`, NodeTypes.Process, x)) : [];
    const stepNodes = steps
      ? steps.map((x, index) => new IndexedNode(`$.steps[${index}]`, NodeTypes.Process, normalizeObiStep(x)))
      : [];

    const welcomes = [],
      fallbacks = [],
      intents = [],
      otherRules = [];

    for (const node of ruleNodes) {
      switch (node[PAYLOAD_KEY].$type) {
        case ObiTypes.WelcomeRule:
          welcomes.push(node);
          break;
        case ObiTypes.NoMatchRule:
          fallbacks.push(node);
          break;
        case ObiTypes.IntentRule:
          intents.push(node);
          break;
        default:
          otherRules.push(node);
          break;
      }
    }

    return {
      welcomes,
      fallbacks,
      intents,
      recognizers: recognizerNodes,
      rules: otherRules,
      steps: stepNodes,
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

    const { recognizers, welcomes, fallbacks, intents } = nodeCollection;

    if (!recognizers || !recognizers[0]) return edges;

    // Connect 'WelcomeRule' before 'recognizer'
    if (welcomes && welcomes[0]) {
      edges.push({
        from: welcomes[0].id,
        to: recognizers[0].id,
      });
    }

    // Connect 'IntentRule' after 'recognizer'
    if (intents && intents.length) {
      intents.forEach(intentRule => {
        edges.push({
          from: recognizers[0].id,
          to: intentRule.id,
        });
      });
    }

    // Connect 'NoMatchRule' after 'recognizer'
    if (fallbacks && fallbacks[0]) {
      edges.push({
        from: recognizers[0].id,
        to: fallbacks[0].id,
      });
    }

    return edges;
  },
  output: (nodeCollection, edges) => {
    const nodes = [].concat(...Object.values(nodeCollection));
    return mergeNodesIntoEdges(nodes, edges);
  },
};
