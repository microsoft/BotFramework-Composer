import { ObiRuleDialog } from '../../../types/obi-dialogs/ObiRuleDialog';
import { DialogTypes } from '../../../types/obi-enums/ObiDialogTypes';
import { BeforeHandler } from '../../../../selectors/types/SelectorPolicy';

export const shouldBeRuleDialog: BeforeHandler<ObiRuleDialog> = (obi: ObiRuleDialog): boolean => {
  return obi.$type === DialogTypes.RuleDialog;
};

export const shouldBeSequenceDialog: BeforeHandler<ObiRuleDialog> = (obi: ObiRuleDialog): boolean => {
  return obi.$type === DialogTypes.SequenceDialog;
};
