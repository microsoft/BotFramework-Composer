import { ObiRuleDialog } from '../../../types/obi-dialogs/ObiRuleDialog';
import { DialogTypes } from '../../../types/obi-enums/ObiDialogTypes';

export function shouldBeRuleDialog(obi: ObiRuleDialog): boolean {
  return obi.$type === DialogTypes.RuleDialog;
}

export function shouldBeSequenceDialog(obi: ObiRuleDialog): boolean {
  return obi.$type === DialogTypes.SequenceDialog;
}
