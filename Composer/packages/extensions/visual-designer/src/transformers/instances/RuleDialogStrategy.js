import { ObiTypes } from '../constants/ObiTypes';
import { NodeTypes } from '../constants/NodeTypes';
import { IndexedNode } from '../models/IndexedNode';
import { mergeNodesIntoEdges } from '../helpers/mergeNodesIntoEdges';

/**
 * When input schema is detected as a RuleDialog of OBI;
 * select its
 *  recognizers from 'recognizer' field (should only exist one recognizer),
 *  welcomes by filtering WelcomRule out of its 'rules' (should only exist one welcome node),
 *  intents by filtering IntentRule out of its 'rules',
 *  fallbacks by filtering FallbackRule out of its 'rules' (should only exist one welcome node);
 * then
 *  connect 'welcome' to 'recognizer',
 *  connect 'recognizer' to all 'intents',
 *  connect 'recognizer' to 'fallback';
 * output a DirectedGraph prop.
 */
export const RuleDialogStrategy = {
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
    const nodes = [].concat(...Object.values(nodeCollection));
    return mergeNodesIntoEdges(nodes, edges);
  },
};

/**
 * Helpers
 */

const selectRecognizers = input => [new IndexedNode(`$.recognizer`, NodeTypes.Decision, input.recognizer)];

const createRuleTypeSelector = targetRuleType => input =>
  input.rules
    .map((rule, index) =>
      rule.$type === targetRuleType ? new IndexedNode(`$.rules[${index}]`, NodeTypes.Process, rule) : null
    )
    .filter(x => x);

const selectWelcomes = createRuleTypeSelector(ObiTypes.rules.WelcomeRule);
const selectFallbacks = createRuleTypeSelector(ObiTypes.rules.FallbackRule);
const selectIntents = createRuleTypeSelector(ObiTypes.rules.IntentRule);
