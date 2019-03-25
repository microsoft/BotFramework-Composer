import { ObiRuleDialog } from '../../../types/obi-dialogs/ObiRuleDialog';
import { DialogTypes } from '../../../types/obi-enums/ObiDialogTypes';
import { TraceableBeforeHandler } from '../../../../selectors/types/SelectorPolicy';

export const shouldBeRuleDialog: TraceableBeforeHandler<ObiRuleDialog> = obi => {
  return obi.$type === DialogTypes.RuleDialog;
};

export const shouldBeSequenceDialog: TraceableBeforeHandler<ObiRuleDialog> = obi => {
  return obi.$type === DialogTypes.SequenceDialog;
};
