import { RuleDialogStrategy } from './instances/RuleDialogStrategy';
import { RuleElementStrategy } from './instances/RuleElementStrategy';
import { consumeStrategy } from './helpers/consumerStrategy';

class ObiTransformer {
  supportedStrategies = [RuleDialogStrategy, RuleElementStrategy];

  checkTransformability(input) {
    const chosenStrategy = this.supportedStrategies.some(strategy => strategy.when(input));
    return !!chosenStrategy;
  }

  toDirectedGraphSchema(input) {
    const chosenStrategy = this.supportedStrategies.find(strategy => strategy.when(input));

    if (chosenStrategy) {
      return consumeStrategy(input, chosenStrategy);
    }
    return [];
  }
}

export const obiTransformer = new ObiTransformer();
