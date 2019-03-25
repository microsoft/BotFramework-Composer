import {
  obiWelcomeRuleToGraphTerminator,
  obiRuleToGraphProcess,
  obiRecognizerToGraphDecision,
} from './handlers/transformer/transform';
import { TraceableTransformerPolicy } from '../../transformers/types/TransformerPolicy';

/**
 * This policy example contains an implicit restriction:
 *  only listed fields should be kept after transformation.
 */
export const ruleDialogTransformerPolicy: TraceableTransformerPolicy<any /** payload should be and OBI element */> = {
  welcome: obiWelcomeRuleToGraphTerminator,
  intent: obiRuleToGraphProcess,
  fallback: obiRuleToGraphProcess,
  recognizer: obiRecognizerToGraphDecision,
};
