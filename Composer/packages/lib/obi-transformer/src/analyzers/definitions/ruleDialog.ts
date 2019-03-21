import { shouldBeRuleDialog } from '../handlers/obiAssertions';
import { validateRuleDialogComponents, isTracable } from '../handlers/resultAssertions';
import {
  selectStorage,
  selectRecognizer,
  selectWelcome,
  selectFallback,
  selectPlainRules,
  selectIntent,
} from '../handlers/selectors';
import {
  obiStorageToGraphIsolated,
  obiRecognizerToGraphDecision,
  obiWelcomeRuleToGraphTerminator,
  obiRuleToGraphProcess,
} from '../handlers/transformers';
import { TraceableData } from '../types/TraceableData';
import { AnalyzerDefinition } from '../types/Analyzer';
import { ObiSchema } from '../../models/obi/ObiSchema';
import { TraceableAnalyzerResult } from '../types/AnalyzerResult';

export const ruleDialogAnalyzerDefinition: AnalyzerDefinition<
  ObiSchema,
  TraceableData<any>,
  TraceableAnalyzerResult
> = {
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
    intent: {
      select: selectIntent,
      validate: isTracable,
      transform: obiRuleToGraphProcess,
    },
    unclassified: {
      select: selectPlainRules,
      validate: isTracable,
      transform: obiRuleToGraphProcess,
    },
  },
};
