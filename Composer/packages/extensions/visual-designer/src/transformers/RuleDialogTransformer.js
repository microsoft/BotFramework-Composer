import { ObiTypes } from './constants/ObiTypes';
import { NodeTypes } from './constants/NodeTypes';
import { IndexedNode } from './IndexedNode';

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
  buildEdges: nodeCollection => {
    const { recognizers, welcomes, fallbacks, intents } = nodeCollection;

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
      intents.forEach(intentRule => {
        edges.push({
          from: recognizers[0].id,
          to: intentRule.id,
        });
      });
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
  output: (nodeCollection, edges) => {
    const nodeList = [].concat(...Object.values(nodeCollection));
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

/**
 * Helpers
 */

const selectRecognizers = input => [new IndexedNode(`$.recognizer`, NodeTypes.Decision, input['recognizer'])];

const createRuleTypeSelector = targetRuleType => input =>
  input.rules
    .map((rule, index) =>
      rule.$type === targetRuleType ? new IndexedNode(`$.rules[${index}]`, NodeTypes.Process, rule) : null
    )
    .filter(x => x);

const selectWelcomes = createRuleTypeSelector(ObiTypes.rules.WelcomeRule);
const selectFallbacks = createRuleTypeSelector(ObiTypes.rules.FallbackRule);
const selectIntents = createRuleTypeSelector(ObiTypes.rules.IntentRule);
