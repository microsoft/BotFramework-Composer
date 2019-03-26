import { RuleDialogTransformer } from './instances/RuleDialogTransformer';
import { RuleElementTransformer } from './instances/RuleElementTransformer';
import { applyTransformer } from './helpers/applyTransformer';

const activeTransformers = [RuleDialogTransformer, RuleElementTransformer];

function chooseTransformer(input) {
  return activeTransformers.find(transformer => transformer.when(input));
}

export function autoTransform(input) {
  const chosenTransformer = chooseTransformer(input);
  if (chosenTransformer) {
    return applyTransformer(input, chosenTransformer);
  }
  return [];
}
