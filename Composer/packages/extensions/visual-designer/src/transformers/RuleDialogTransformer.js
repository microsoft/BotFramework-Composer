import { ObiTypes } from './constants/ObiTypes';
import { NodeTypes } from './constants/NodeTypes';
import { PAYLOAD_KEY } from '../utils/constant';

const selectRecognizers = input => [
  {
    id: `$.recognizer`,
    type: NodeTypes.Decision,
    [PAYLOAD_KEY]: input['recognizer'],
  },
];

const selectWelcomes = input =>
  input.rules
    .map((rule, index) =>
      rule.$type === ObiTypes.rules.WelcomeRule
        ? { id: `$.rules[${index}]`, type: NodeTypes.Process, [PAYLOAD_KEY]: rule }
        : null
    )
    .filter(x => x);

const selectFallbacks = input =>
  input.rules
    .map((rule, index) =>
      rule.$type === ObiTypes.rules.FallbackRule
        ? { id: `$.rules[${index}]`, type: NodeTypes.Process, [PAYLOAD_KEY]: rule }
        : null
    )
    .filter(x => x);

const selectIntents = input =>
  input.rules
    .map((rule, index) =>
      rule.$type === ObiTypes.rules.IntentRule
        ? { id: `$.rules[${index}]`, type: NodeTypes.Process, [PAYLOAD_KEY]: rule }
        : null
    )
    .filter(x => x);

export const RuleDialogTransformer = {
  // When input schema is a ObiRuleDialog.
  when: input => input && input.$type === ObiTypes.dialogs.ObiRuleDialog,
  // Select below elements.
  selectNodes: input => {
    return {
      recognizers: selectRecognizers(input),
      welcomes: selectWelcomes(input),
      fallbacks: selectFallbacks(input),
      intents: selectIntents(input),
    };
  },
  // Then connect specific elements: welcome -> reconizer -> intent.
  buildEdges: nodes => {
    const { recognizers, welcomes, fallbacks, intents } = nodes;

    // ObiRuleDialog must has at least one recognizer.
    if (!recognizers || !recognizers[0]) return [];

    const edges = [];

    // Connect 'WelcomeRule' before 'recognizer'
    if (welcomes && welcomes[0]) {
      edges.push({
        from: welcomes[0].id,
        to: recognizers[0].id,
      });
    }

    // Connect 'IntentRule' after 'recognizer'
    if (intents && intents.length) {
      const recognizerIntents = Object.keys(recognizers[0][PAYLOAD_KEY].rules);

      for (const intentName of recognizerIntents) {
        const targetRule = intents.find(intentNode => intentNode[PAYLOAD_KEY].intent === intentName);

        if (!targetRule) continue;
        else edges.push({ from: recognizers[0].id, to: targetRule.id });
      }
    }

    // Connect 'FallbackRule' after 'recognizer'
    if (fallbacks && fallbacks[0]) {
      edges.push({
        from: fallbacks[0].id,
        to: recognizers[0].id,
      });
    }

    return edges;
  },
  output: (nodes, edges) => {
    const nodeList = [].concat(...Object.values(nodes));
    const nodeById = nodeList.reduce(
      (accumulated, currentNode) => ({
        ...accumulated,
        [currentNode.id]: {
          ...currentNode,
          neighborIds: [],
        },
      }),
      {}
    );

    edges.forEach(edge => {
      const { from, to } = edge;
      nodeById[from].neighborIds.push(to);
    });

    return Object.values(nodeById);
  },
};
