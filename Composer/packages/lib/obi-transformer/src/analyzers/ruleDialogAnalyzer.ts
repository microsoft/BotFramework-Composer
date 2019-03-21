import { shouldBeRuleDialog } from './handlers/obiAssertions';
import { validateRuleDialogComponents, isTracable } from './handlers/resultAssertions';
import {
  selectStorage,
  selectRecognizer,
  selectWelcome,
  selectFallback,
  selectPlainRules,
} from './handlers/traceableSelector';
import {
  obiStorageToGraphIsolated,
  obiRecognizerToGraphDecision,
  obiWelcomeRuleToGraphTerminator,
  obiRuleToGraphProcess,
} from './handlers/transformers';
import { iteratively } from './handlers/utils';

export const ruleDialogAnalyzer = {
  before: [shouldBeRuleDialog],
  after: [validateRuleDialogComponents],
  transform: {
    storage: {
      select: selectStorage,
      validate: isTracable,
      transform: [obiStorageToGraphIsolated],
    },
    recognizer: {
      select: selectRecognizer,
      validate: isTracable,
      transform: [obiRecognizerToGraphDecision],
    },
    welcome: {
      select: selectWelcome,
      validate: isTracable,
      transform: [obiWelcomeRuleToGraphTerminator],
    },
    fallback: {
      select: selectFallback,
      validate: isTracable,
      transform: [obiRuleToGraphProcess],
    },
    rules: {
      select: selectPlainRules,
      validate: [Array.isArray, arr => !iteratively(isTracable)(arr).some(isPassed => isPassed === false)],
      transform: [iteratively(obiRuleToGraphProcess)],
    },
  },
};
