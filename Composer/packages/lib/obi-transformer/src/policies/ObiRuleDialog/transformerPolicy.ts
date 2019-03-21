import {
  obiWelcomeRuleToGraphTerminator,
  obiRuleToGraphProcess,
  obiRecognizerToGraphDecision,
} from './handlers/transformer/transform';
import { TransformerPolicyCollection } from '../../transformers/types/TransformerPolicy';

/**
 * This policy example contains an implicit restriction:
 *  only listed fields should be kept after transformation.
 */
export const ruleDialogTransformerPolicy: TransformerPolicyCollection = {
  welcome: obiWelcomeRuleToGraphTerminator,
  intent: obiRuleToGraphProcess,
  fallback: obiRuleToGraphProcess,
  recognizer: obiRecognizerToGraphDecision,
};
