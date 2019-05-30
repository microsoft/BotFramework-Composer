import { ObiTypes } from '../shared/ObiTypes';

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
function transformRecognizerDialog(input) {
  if (!input) return {};
  const { rules, steps, recognizer } = input;

  const recognizerNode = recognizer ? new IndexedNode(`$.recognizer`, recognizer) : null;
  const ruleNodes = rules ? rules.map((x, index) => new IndexedNode(`$.rules[${index}]`, x)) : [];
  const stepNodes = steps ? steps.map((x, index) => new IndexedNode(`$.steps[${index}]`, normalizeObiStep(x))) : [];

  const eventNodes = [],
    intentNodes = [],
    otherRuleNodes = [];

  for (const node of ruleNodes) {
    switch (node.json.$type) {
      case ObiTypes.UnknownIntentRule:
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
    const payload = {
      $type: ObiTypes.RecognizerGroup,
      recognizer: recognizerNode,
    };

    if (eventNodes.length) {
      payload.eventGroup = new IndexedNode('$.eventGroup', {
        $type: ObiTypes.EventGroup,
        children: eventNodes,
      });
    }

    if (intentNodes.length) {
      payload.intentGroup = new IndexedNode('$.intentGroup', {
        $type: ObiTypes.IntentGroup,
        children: intentNodes,
      });
    }

    result.recognizerGroup = new IndexedNode('$.recognizerGroup', payload);
  }

  if (otherRuleNodes.length) {
    result.ruleGroup = new IndexedNode('$.rules', {
      $type: ObiTypes.RuleGroup,
      children: otherRuleNodes,
    });
  }

  result.stepGroup = new IndexedNode('$.steps', {
    $type: ObiTypes.StepGroup,
    children: stepNodes,
  });
  return result;
}

function transformSimpleDialog(input) {
  if (!input) return {};

  const rules = input.rules || [];
  const steps = input.steps || [];

  const result = {};
  if (rules.length) {
    result.ruleGroup = new IndexedNode('$.rules', {
      $type: ObiTypes.RuleGroup,
      children: rules.map((x, index) => new IndexedNode(`$.rules[${index}]`, x)),
    });
  }

  result.stepGroup = new IndexedNode('$.steps', {
    $type: ObiTypes.StepGroup,
    children: steps.map((x, index) => new IndexedNode(`$.steps[${index}]`, normalizeObiStep(x))),
  });
  return result;
}

export function transformRootDialog(input) {
  if (!input) return {};
  if (input.recognizer && input.recognizer.$type) {
    return transformRecognizerDialog(input);
  }
  return transformSimpleDialog(input);
}
