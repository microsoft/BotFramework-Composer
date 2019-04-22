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

function transformSimpleDialog(input) {
  if (!input) return {};

  const result = {};
  if (Array.isArray(input.rules)) {
    result.ruleGroup = new IndexedNode('$.rules', {
      $type: ObiTypes.RuleGroup,
      children: input.rules.map((x, index) => new IndexedNode(`$.rules[${index}]`, x)),
    });
  }

  if (Array.isArray(input.steps)) {
    result.stepGroup = new IndexedNode('$.steps', {
      $type: ObiTypes.StepGroup,
      children: input.steps.map((x, index) => new IndexedNode(`$.steps[${index}]`, x)),
    });
  }
  return result;
}

export default function transform(input) {
  if (!input) return {};
  if (input.recognizer && input.recognizer.$type) {
    return transformRecognizerDialog(input);
  }
  return transformSimpleDialog(input);
}
