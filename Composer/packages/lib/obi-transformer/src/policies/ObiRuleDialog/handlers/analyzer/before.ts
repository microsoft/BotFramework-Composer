import { ObiRuleDialog } from '../../../../models/obi/ObiRuleDialog';
import { DialogTypes } from '../../../../models/obi/types/DialogTypes';

export function shouldBeRuleDialog(obi: ObiRuleDialog): boolean {
  return obi.$type === DialogTypes.RuleDialog;
}

export function shouldBeSequenceDialog(obi: ObiRuleDialog): boolean {
  return obi.$type === DialogTypes.SequenceDialog;
}
