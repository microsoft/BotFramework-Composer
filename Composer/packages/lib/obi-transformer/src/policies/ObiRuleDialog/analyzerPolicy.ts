import { shouldBeRuleDialog } from './handlers/obiAssertions';
import { validateRuleDialogComponents, isTracable } from './handlers/resultAssertions';
import {
  selectStorage,
  selectRecognizer,
  selectWelcome,
  selectFallback,
  selectPlainRules,
  selectIntent,
} from './handlers/selectors';
import { TraceableData } from '../../analyzers/types/TraceableData';
import { AnalyzerDefinition } from '../../analyzers/types/Analyzer';
import { ObiSchema } from '../../models/obi/ObiSchema';
import { TraceableAnalyzerResult } from '../../analyzers/types/AnalyzerResult';

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
    },
    recognizer: {
      select: selectRecognizer,
      validate: isTracable,
    },
    welcome: {
      select: selectWelcome,
      validate: isTracable,
    },
    fallback: {
      select: selectFallback,
      validate: isTracable,
    },
    intent: {
      select: selectIntent,
      validate: isTracable,
    },
    unclassified: {
      select: selectPlainRules,
      validate: isTracable,
    },
  },
};
