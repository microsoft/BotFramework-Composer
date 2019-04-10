import { ObiTypes } from '../constants/ObiTypes';
import { NodeTypes } from '../constants/NodeTypes';
import { IndexedNode } from '../models/IndexedNode';
import { mergeNodesIntoEdges } from '../helpers/mergeNodesIntoEdges';
import { PAYLOAD_KEY } from '../../utils/constant';
import { normalizeObiStep } from '../helpers/elementBuilder';

/**
 *      Recognizer
 *          |
 *       Events
 *          |
 *      ---------
 *      |intent1|
 *      |intent2|
 *      |intent3|
 *      |   +   |
 *      ---------
 */
export const RootDialogStrategy = {
  selectNodes: input => {
    if (!input) return {};

    const { rules, steps, recognizer } = input;

    const recognizerNodes = recognizer ? [new IndexedNode(`$.recognizer`, NodeTypes.Decision, recognizer)] : [];
    const ruleNodes = rules ? rules.map((x, index) => new IndexedNode(`$.rules[${index}]`, NodeTypes.Process, x)) : [];
    const stepNodes = steps
      ? steps.map((x, index) => new IndexedNode(`$.steps[${index}]`, NodeTypes.Process, normalizeObiStep(x)))
      : [];

    const events = [],
      intents = [],
      otherRules = [];

    for (const node of ruleNodes) {
      switch (node[PAYLOAD_KEY].$type) {
        case ObiTypes.WelcomeRule:
        case ObiTypes.NoMatchRule:
          events.push(node);
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
      eventGroup: new IndexedNode('$.eventGroup', NodeTypes.Group, {
        $type: ObiTypes.EventGroup,
        children: events,
      }),
      intentGroup: new IndexedNode('$.intentGroup', NodeTypes.Process, {
        $type: ObiTypes.IntentGroup,
        children: intents,
      }),
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

    const { recognizers, eventGroup, intentGroup } = nodeCollection;

    if (!recognizers || !recognizers[0]) return edges;

    edges.push({
      from: recognizers[0].id,
      to: eventGroup.id,
    });

    edges.push({
      from: eventGroup.id,
      to: intentGroup.id,
    });

    return edges;
  },
  output: (nodeCollection, edges) => {
    const nodes = [].concat(...Object.values(nodeCollection));
    return mergeNodesIntoEdges(nodes, edges);
  },
};
