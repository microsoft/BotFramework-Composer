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
import { TraceableData } from '../../types/TraceableData';
import { SelectorPolicy } from '../../analyzers/types/SelectorPolicy';
import { ObiSchema } from '../../models/obi/ObiSchema';
import { TraceableSelectionResult } from '../../analyzers/types/SelectionResult';

export const ruleDialogAnalyzerPolicy: SelectorPolicy<ObiSchema, TraceableData<any>, TraceableSelectionResult> = {
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
