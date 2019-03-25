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
import { TraceableSelectorPolicy } from '../../selectors/types/SelectorPolicy';
import { ObiRuleDialog } from '../types/obi-dialogs/ObiRuleDialog';

export const ruleDialogAnalyzerPolicy: TraceableSelectorPolicy<ObiRuleDialog, any> = {
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
