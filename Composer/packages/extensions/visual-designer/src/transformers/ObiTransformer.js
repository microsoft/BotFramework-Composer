import { RuleDialogStrategy } from './instances/RuleDialogStrategy';
import { RuleElementStrategy } from './instances/RuleElementStrategy';
import { consumeStrategy } from './helpers/consumerStrategy';

export class ObiTransformer {
  supportedStrategies = [RuleDialogStrategy, RuleElementStrategy];

  toDirectedGraphSchema(input) {
    const chosenStrategy = this.supportedStrategies.find(strategy => strategy.when(input));

    if (chosenStrategy) {
      return consumeStrategy(input, chosenStrategy);
    }
    return [];
  }
}
