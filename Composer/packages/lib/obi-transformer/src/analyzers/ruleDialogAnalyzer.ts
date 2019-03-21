import { shouldBeRuleDialog } from './handlers/obiAssertions';
import { validateRuleDialogComponents, isTracable } from './handlers/resultAssertions';
import { selectStorage, selectRecognizer, selectWelcome, selectFallback, selectPlainRules } from './handlers/selectors';
import {
  obiStorageToGraphIsolated,
  obiRecognizerToGraphDecision,
  obiWelcomeRuleToGraphTerminator,
  obiRuleToGraphProcess,
} from './handlers/transformers';
import { TraceableData } from './types/TraceableData';
import { AnalyzerDefinition } from './types/Analyzer';
import { ObiSchema } from '../models/obi/ObiSchema';
import { RuleDialogComponents } from './types/RuleDialogComponents';

export const ruleDialogAnalyzer: AnalyzerDefinition<ObiSchema, TraceableData<any>, RuleDialogComponents> = {
  before: [shouldBeRuleDialog],
  after: [validateRuleDialogComponents],
  execution: {
    storage: {
      select: selectStorage,
      validate: isTracable,
      transform: obiStorageToGraphIsolated,
    },
    recognizer: {
      select: selectRecognizer,
      validate: isTracable,
      transform: obiRecognizerToGraphDecision,
    },
    welcome: {
      select: selectWelcome,
      validate: isTracable,
      transform: obiWelcomeRuleToGraphTerminator,
    },
    fallback: {
      select: selectFallback,
      validate: isTracable,
      transform: obiRuleToGraphProcess,
    },
    rules: {
      select: selectPlainRules,
      validate: isTracable,
      transform: obiRuleToGraphProcess,
    },
  },
};
