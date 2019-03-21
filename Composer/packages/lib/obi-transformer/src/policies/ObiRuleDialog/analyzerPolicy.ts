import { shouldBeRuleDialog } from './handlers/analyzer/before';
import { validateRuleDialogComponents } from './handlers/analyzer/after';
import { isTracable } from './handlers/analyzer/validate';
import {
  selectStorage,
  selectRecognizer,
  selectWelcome,
  selectFallback,
  selectPlainRules,
  selectIntent,
} from './handlers/analyzer/select';
import { TraceableData } from '../../analyzers/types/TraceableData';
import { AnalyzerDefinition } from '../../analyzers/types/Analyzer';
import { ObiSchema } from '../../models/obi/ObiSchema';
import { TraceableAnalyzerResult } from '../../analyzers/types/AnalyzerResult';

export const ruleDialogAnalyzerPolicy: AnalyzerDefinition<ObiSchema, TraceableData<any>, TraceableAnalyzerResult> = {
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
