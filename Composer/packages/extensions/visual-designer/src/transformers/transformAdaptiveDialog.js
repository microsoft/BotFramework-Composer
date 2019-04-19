import { ObiTypes } from './constants/ObiTypes';
import { IndexedNode } from './models/IndexedNode';
import { normalizeObiStep } from './helpers/elementBuilder';

/**
 *      Recognizer    Rules     Steps
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
export default function transform(input) {
  if (!input || input.$type !== ObiTypes.AdaptiveDialog) return {};
  const { rules, steps, recognizer } = input;

  const recognizerNode = recognizer ? new IndexedNode(`$.recognizer`, recognizer) : null;
  const ruleNodes = rules ? rules.map((x, index) => new IndexedNode(`$.rules[${index}]`, x)) : [];
  const stepNodes = steps ? steps.map((x, index) => new IndexedNode(`$.steps[${index}]`, normalizeObiStep(x))) : [];

  const eventNodes = [],
    intentNodes = [],
    otherRuleNodes = [];

  for (const node of ruleNodes) {
    switch (node.json.$type) {
      case ObiTypes.WelcomeRule:
      case ObiTypes.NoMatchRule:
      case ObiTypes.EventRule:
        eventNodes.push(node);
        break;
      case ObiTypes.IntentRule:
        intentNodes.push(node);
        break;
      default:
        otherRuleNodes.push(node);
        break;
    }
  }

  const result = {};
  if (recognizerNode) {
    result.recognizer = recognizerNode;
  }
  if (eventNodes.length) {
    result.eventGroup = new IndexedNode('$.eventGroup', {
      $type: ObiTypes.EventGroup,
      children: eventNodes,
    });
  }
  if (intentNodes.length) {
    result.intentGroup = new IndexedNode('$.intentGroup', {
      $type: ObiTypes.IntentGroup,
      children: intentNodes,
    });
  }
  if (otherRuleNodes.length) {
    result.ruleGroup = new IndexedNode('$.ruleGroup', {
      $type: ObiTypes.RuleGroup,
      children: otherRuleNodes,
    });
  }
  if (stepNodes.length) {
    result.stepGroup = new IndexedNode('$.stepGroup', {
      $type: ObiTypes.StepGroup,
      children: stepNodes,
    });
  }
  return result;
}
